/**
 * Compatibility shim: implements the react-router-dom v6 API surface used by
 * the legacy app on top of the TanStack Router history/location.
 * Supports nested <Routes>/<Route> trees, path params, splats, relative
 * navigation, search params and basename.
 */
import * as React from "react";
import {
  useRouter,
  useRouterState,
  type AnyRouter,
} from "@tanstack/react-router";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RouteDef {
  path?: string;
  index?: boolean;
  element?: React.ReactNode;
  children?: RouteDef[];
}

interface BranchMeta {
  route: RouteDef;
  pathnameBase: string;
}

interface MatchedBranch {
  routesMeta: BranchMeta[];
  params: Record<string, string>;
}

interface LocationShape {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
  key: string;
}

interface RouteContextValue {
  outlet: React.ReactNode;
  params: Record<string, string>;
  pathnameBase: string;
}

interface RouterContextValue {
  location: LocationShape;
  basename: string;
  navigate: (to: string | number, options?: NavigateOptions) => void;
  router: AnyRouter;
}

interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

const RouterCtx = React.createContext<RouterContextValue | null>(null);
const RouteCtx = React.createContext<RouteContextValue>({
  outlet: null,
  params: {},
  pathnameBase: "/",
});

// ---------------------------------------------------------------------------
// Path utilities
// ---------------------------------------------------------------------------

function stripBasename(pathname: string, basename: string): string {
  if (!basename || basename === "/") return pathname;
  if (pathname === basename) return "/";
  if (pathname.startsWith(basename + "/")) return pathname.slice(basename.length);
  return pathname;
}

function joinPaths(paths: string[]): string {
  return paths.join("/").replace(/\/\/+/g, "/");
}

function normalizePathname(pathname: string): string {
  let p = pathname.replace(/\/+/g, "/");
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || "/";
}

/** Resolve a possibly-relative `to` against a route pathname base. */
function resolvePath(to: string, fromPathname: string): { pathname: string; search: string; hash: string } {
  const hashIdx = to.indexOf("#");
  let hash = "";
  if (hashIdx >= 0) {
    hash = to.slice(hashIdx);
    to = to.slice(0, hashIdx);
  }
  const searchIdx = to.indexOf("?");
  let search = "";
  if (searchIdx >= 0) {
    search = to.slice(searchIdx);
    to = to.slice(0, searchIdx);
  }
  let pathname: string;
  if (to.startsWith("/")) {
    pathname = to;
  } else if (to === "") {
    pathname = fromPathname;
  } else {
    const segments = fromPathname.replace(/\/+$/, "").split("/");
    for (const seg of to.split("/")) {
      if (seg === "..") segments.pop();
      else if (seg !== "." && seg !== "") segments.push(seg);
    }
    pathname = segments.join("/") || "/";
    if (!pathname.startsWith("/")) pathname = "/" + pathname;
  }
  return { pathname: normalizePathname(pathname), search, hash };
}

/** Compile a path pattern like `admin/:id/*` into a regex. */
function compilePath(pattern: string, end: boolean): { regexp: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  let source = "^";
  const trimmed = pattern.replace(/^\/*/, "/");
  const segments = trimmed.split("/").filter((s) => s !== "");
  for (const segment of segments) {
    source += "/";
    if (segment === "*") {
      paramNames.push("*");
      source += "(.*)";
      end = false;
      break;
    } else if (segment.startsWith(":")) {
      paramNames.push(segment.slice(1));
      source += "([^/]+)";
    } else {
      source += segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  if (segments.length === 0) source += "/";
  source += end ? "/?$" : "(?:\\/|$)";
  return { regexp: new RegExp(source, "i"), paramNames };
}

function scoreSegment(segment: string): number {
  if (segment === "*") return -2;
  if (segment.startsWith(":")) return 3;
  if (segment === "") return 0;
  return 10;
}

function flattenBranches(
  routes: RouteDef[],
  parentPath = "",
  parentRoutes: BranchMeta[] = []
): Array<{ score: number; routesMeta: BranchMeta[]; path: string }> {
  const branches: Array<{ score: number; routesMeta: BranchMeta[]; path: string }> = [];
  for (const route of routes) {
    const path = route.path ?? "";
    const joinedPath = path.startsWith("/") ? path : joinPaths([parentPath, path]);
    const meta: BranchMeta[] = [...parentRoutes, { route, pathnameBase: joinedPath.replace(/\/\*$/, "") || "/" }];
    if (route.children && route.children.length > 0) {
      branches.push(...flattenBranches(route.children, joinedPath, meta));
    }
    if (route.index || (route.element != null && (!route.children || route.children.length === 0))) {
      const effectivePath = route.index ? parentPath : joinedPath;
      const score = effectivePath
        .split("/")
        .filter(Boolean)
        .reduce((acc, seg) => acc + scoreSegment(seg), 0) + (route.index ? 2 : 0);
      branches.push({
        score,
        routesMeta: route.index ? parentRoutes.length ? [...parentRoutes, { route, pathnameBase: parentPath || "/" }] : meta : meta,
        path: effectivePath || "/",
      });
    }
  }
  return branches;
}

function matchBranches(
  routes: RouteDef[],
  pathname: string
): MatchedBranch | null {
  const branches = flattenBranches(routes);
  branches.sort((a, b) => b.score - a.score);
  const target = normalizePathname(pathname);
  for (const branch of branches) {
    const lastMeta = branch.routesMeta[branch.routesMeta.length - 1];
    const isSplat = branch.path.endsWith("/*") || branch.path === "*";
    const { regexp, paramNames } = compilePath(branch.path, !isSplat);
    const match = target.match(regexp);
    if (!match) continue;
    // For non-splat branches, require a full match.
    if (!isSplat && match[0].replace(/\/$/, "") !== target && branch.path !== target) {
      // full-match enforced by end regex; this is a safety check
    }
    const params: Record<string, string> = {};
    paramNames.forEach((name, i) => {
      params[name] = decodeURIComponent(match[i + 1] ?? "");
    });
    void lastMeta;
    return { routesMeta: branch.routesMeta, params };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Router provider
// ---------------------------------------------------------------------------

function useRouterContext(): RouterContextValue {
  const ctx = React.useContext(RouterCtx);
  if (!ctx) throw new Error("rr-compat: router context missing");
  return ctx;
}

export function BrowserRouter({
  children,
  basename = "/",
}: {
  children?: React.ReactNode;
  basename?: string;
  /** Aceito por compatibilidade com MemoryRouter (ignorado). */
  initialEntries?: string[];
}) {
  const router = useRouter();
  const routerState = useRouterState({ select: (s) => s.location });
  const rawPathname = routerState.pathname;
  const pathname = stripBasename(rawPathname, basename);

  const location: LocationShape = React.useMemo(
    () => ({
      pathname,
      search: routerState.searchStr ?? "",
      hash: routerState.hash ? `#${routerState.hash}` : "",
      state: routerState.state,
      key: routerState.href,
    }),
    [pathname, routerState.searchStr, routerState.hash, routerState.state, routerState.href]
  );

  const navigate = React.useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === "number") {
        if (to === -1) router.history.back();
        else if (to === 1) router.history.forward();
        else router.history.go(to);
        return;
      }
      const resolved = resolvePath(to, pathname);
      const href = normalizePathname(joinPaths([basename === "/" ? "" : basename, resolved.pathname])) + resolved.search + resolved.hash;
      void router.navigate({
        to: href as never,
        replace: options?.replace,
        state: options?.state as never,
        resetScroll: true,
      });
    },
    [router, basename, pathname]
  );

  const value = React.useMemo(
    () => ({ location, basename, navigate, router }),
    [location, basename, navigate, router]
  );

  return <RouterCtx.Provider value={value}>{children}</RouterCtx.Provider>;
}

export const MemoryRouter = BrowserRouter;
export const HashRouter = BrowserRouter;

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useLocation(): LocationShape {
  return useRouterContext().location;
}

export type NavigateFunction = (to: string | number, options?: NavigateOptions) => void;

export function useNavigate(): NavigateFunction {
  return useRouterContext().navigate;
}

export function useParams<Params extends Record<string, string> = Record<string, string>>(): Params {
  return React.useContext(RouteCtx).params as Params;
}

export type SetURLSearchParams = (
  init:
    | URLSearchParams
    | string
    | Record<string, string>
    | ((prev: URLSearchParams) => URLSearchParams | string | Record<string, string>),
  options?: NavigateOptions
) => void;

export function useSearchParams(
  defaultInit?: URLSearchParams | string
): [URLSearchParams, SetURLSearchParams] {
  const { location, router } = useRouterContext();
  const params = React.useMemo(
    () => new URLSearchParams(location.search || (defaultInit ? defaultInit.toString() : "")),
    [location.search, defaultInit]
  );
  const setParams = React.useCallback<SetURLSearchParams>(
    (init, options) => {
      const resolved =
        typeof init === "function"
          ? init(new URLSearchParams(location.search))
          : init;
      const next =
        typeof resolved === "string"
          ? resolved
          : new URLSearchParams(resolved as Record<string, string>).toString();
      const href = `${location.pathname}${next ? `?${next}` : ""}`;
      if (options?.replace) router.history.replace(href, options.state as never);
      else router.history.push(href, options?.state as never);
    },
    [router, location.pathname, location.search]
  );
  return [params, setParams];
}

export function useNavigationType(): string {
  return "POP";
}

export function matchPath(pattern: string, pathname: string): { params: Record<string, string> } | null {
  const end = !pattern.endsWith("*");
  const { regexp, paramNames } = compilePath(pattern, end);
  const match = normalizePathname(pathname).match(regexp);
  if (!match) return null;
  const params: Record<string, string> = {};
  paramNames.forEach((name, i) => {
    params[name] = decodeURIComponent(match[i + 1] ?? "");
  });
  return { params };
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function readRouteDefs(children: React.ReactNode): RouteDef[] {
  const defs: RouteDef[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as {
      path?: string;
      index?: boolean;
      element?: React.ReactNode;
      children?: React.ReactNode;
    };
    defs.push({
      path: props.path,
      index: props.index,
      element: props.element,
      children: props.children ? readRouteDefs(props.children) : undefined,
    });
  });
  return defs;
}

export function Route(_props: {
  path?: string;
  index?: boolean;
  element?: React.ReactNode;
  children?: React.ReactNode;
}): null {
  return null;
}

function renderMatches(
  meta: BranchMeta[],
  params: Record<string, string>,
  fullParams: Record<string, string>
): React.ReactNode {
  // Render from the inside out: innermost element first.
  return meta.reduceRight<React.ReactNode>((outlet, branchMeta, index) => {
    const element =
      branchMeta.route.element != null ? branchMeta.route.element : <Outlet />;
    const accumulatedParams = { ...fullParams };
    void params;
    return (
      <RouteCtx.Provider
        value={{
          outlet,
          params: accumulatedParams,
          pathnameBase: normalizePathname(branchMeta.pathnameBase || "/"),
        }}
      >
        {element}
      </RouteCtx.Provider>
    );
  }, null as React.ReactNode);
}

export function Routes({
  children,
  location: locationProp,
}: {
  children?: React.ReactNode;
  location?: Partial<LocationShape> | string;
}): React.ReactElement | null {
  const { location } = useRouterContext();
  const pathname =
    typeof locationProp === "string"
      ? locationProp
      : locationProp?.pathname ?? location.pathname;
  const routes = readRouteDefs(children);
  const matched = matchBranches(routes, pathname);
  if (!matched) return null;
  return <>{renderMatches(matched.routesMeta, matched.params, matched.params)}</>;
}

export function Outlet(): React.ReactNode {
  return <>{React.useContext(RouteCtx).outlet}</>;
}

export function Navigate({
  to,
  replace = false,
  state,
}: {
  to: string;
  replace?: boolean;
  state?: unknown;
}): null {
  const navigate = useNavigate();
  const { pathnameBase } = React.useContext(RouteCtx);
  const { location } = useRouterContext();
  React.useEffect(() => {
    const from = pathnameBase === "/" ? location.pathname : pathnameBase;
    const resolved = resolvePath(to, from);
    navigate(resolved.pathname + resolved.search + resolved.hash, { replace, state });
  }, [to, replace, state, navigate, pathnameBase, location.pathname]);
  return null;
}

function useHrefCompat(to: string): string {
  const { basename, location } = useRouterContext();
  const { pathnameBase } = React.useContext(RouteCtx);
  const from = pathnameBase === "/" ? location.pathname : pathnameBase;
  const resolved = resolvePath(to, from);
  return normalizePathname(joinPaths([basename === "/" ? "" : basename, resolved.pathname])) + resolved.search + resolved.hash;
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace?: boolean;
  state?: unknown;
  preventScrollReset?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state, onClick, target, preventScrollReset, ...rest },
  ref
) {
  const { navigate } = useRouterContext();
  const href = useHrefCompat(to);
  const { pathnameBase } = React.useContext(RouteCtx);
  const { location } = useRouterContext();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      (target && target !== "_self") ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    const from = pathnameBase === "/" ? location.pathname : pathnameBase;
    const resolved = resolvePath(to, from);
    navigate(resolved.pathname + resolved.search + resolved.hash, { replace, state });
  };

  return <a {...rest} href={href} onClick={handleClick} target={target} ref={ref} />;
});

export interface NavLinkProps extends Omit<LinkProps, "className" | "style" | "children"> {
  caseSensitive?: boolean;
  end?: boolean;
  className?: string | ((opts: { isActive: boolean; isPending: boolean }) => string | undefined);
  style?:
    | React.CSSProperties
    | ((opts: { isActive: boolean; isPending: boolean }) => React.CSSProperties | undefined);
  children?: React.ReactNode | ((opts: { isActive: boolean; isPending: boolean }) => React.ReactNode);
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { to, className, style, children, end = false, caseSensitive = false, ...rest },
  ref
) {
  const { location } = useRouterContext();
  const href = useHrefCompat(to);
  const toPathname = href.split(/[?#]/)[0];
  const current = caseSensitive ? location.pathname : location.pathname.toLowerCase();
  const targetPath = caseSensitive ? toPathname : toPathname.toLowerCase();
  const isActive =
    current === targetPath ||
    (!end && targetPath !== "/" && current.startsWith(targetPath.endsWith("/") ? targetPath : targetPath + "/"));
  const opts = { isActive, isPending: false };

  const resolvedClassName = typeof className === "function" ? className(opts) : className;
  const resolvedStyle = typeof style === "function" ? style(opts) : style;
  const resolvedChildren = typeof children === "function" ? children(opts) : children;

  return (
    <Link {...rest} to={to} ref={ref} className={resolvedClassName} style={resolvedStyle} aria-current={isActive ? "page" : undefined}>
      {resolvedChildren}
    </Link>
  );
});

export function useOutlet(): React.ReactNode {
  return React.useContext(RouteCtx).outlet;
}

export function useResolvedPath(to: string): { pathname: string; search: string; hash: string } {
  const { location } = useRouterContext();
  const { pathnameBase } = React.useContext(RouteCtx);
  const from = pathnameBase === "/" ? location.pathname : pathnameBase;
  return resolvePath(to, from);
}

export function useMatch(pattern: string): { params: Record<string, string> } | null {
  const { location } = useRouterContext();
  return matchPath(pattern, location.pathname);
}

export function generatePath(path: string, params: Record<string, string> = {}): string {
  return path
    .replace(/:([a-zA-Z_]+)/g, (_, key) => params[key] ?? `:${key}`)
    .replace(/\*$/, params["*"] ?? "");
}

export function useInRouterContext(): boolean {
  return React.useContext(RouterCtx) != null;
}

export function createSearchParams(init?: string | Record<string, string>): URLSearchParams {
  return new URLSearchParams(init);
}

export function resolvePathExport(to: string, from = "/") {
  return resolvePath(to, from);
}
