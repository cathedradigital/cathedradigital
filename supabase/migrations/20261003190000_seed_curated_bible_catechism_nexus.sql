-- Curated Bible ↔ Catechism Nexus relations.
-- Sources: Catechism of the Catholic Church, §§279 and 461.
insert into public.nexus_relations
  (relation_type, source_kind, source_ref, target_kind, target_ref, attributed_to, note, confidence, status)
select 'cites','bible_verse',jsonb_build_object('abbr','Gn','chapter',1,'verse',1),'catechism_paragraph',jsonb_build_object('paragraph',279),'Catecismo da Igreja Católica','O §279 cita explicitamente Gn 1,1 como as palavras solenes com que começa a Sagrada Escritura.',1.0,'published'
where not exists (select 1 from public.nexus_relations where source_kind='bible_verse' and source_ref=jsonb_build_object('abbr','Gn','chapter',1,'verse',1) and target_kind='catechism_paragraph' and target_ref=jsonb_build_object('paragraph',279));

insert into public.nexus_relations
  (relation_type, source_kind, source_ref, target_kind, target_ref, attributed_to, note, confidence, status)
select 'cites','bible_verse',jsonb_build_object('abbr','Jo','chapter',1,'verse',14),'catechism_paragraph',jsonb_build_object('paragraph',461),'Catecismo da Igreja Católica','O §461 retoma explicitamente Jo 1,14 ao explicar a Encarnação: o Verbo fez-Se carne.',1.0,'published'
where not exists (select 1 from public.nexus_relations where source_kind='bible_verse' and source_ref=jsonb_build_object('abbr','Jo','chapter',1,'verse',14) and target_kind='catechism_paragraph' and target_ref=jsonb_build_object('paragraph',461));
