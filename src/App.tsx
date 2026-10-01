// SKILLS ATIVADOS: cathedra-operating-system, cathedra-design-system-guardian, cathedra-architecture-guardian, cathedra-saints-expert
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, useContext } from 'react';
import { HelmetProvider } from '@/lib/helmet-compat';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from '@/lib/rr-compat';
import { resolveSpaceForPath } from '@/lib/spaces/resolveSpace';
