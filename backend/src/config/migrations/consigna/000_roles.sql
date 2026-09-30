-- ════════════════════════════════════════════════════════════════════
-- 000 · ROLES  (ejecutar UNA vez, como usuario administrador de RDS)
-- Objetivo: la app de consigna NO puede modificar datos existentes
-- (artistas registrados, fases, curadores). Solo lectura sobre ellos.
-- ════════════════════════════════════════════════════════════════════

CREATE ROLE consigna_app LOGIN PASSWORD 'CAMBIAR_POR_SECRETO_EN_SECRETS_MANAGER';

-- Esquema aislado para todo lo nuevo
CREATE SCHEMA IF NOT EXISTS consigna AUTHORIZATION consigna_app;

-- Por defecto: nada sobre el esquema público
REVOKE ALL ON SCHEMA public FROM consigna_app;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM consigna_app;

-- La app NO lee tablas directamente: lee SOLO las vistas de 002_vistas_lectura.sql.
-- Las vistas pertenecen al administrador (dueño de las tablas originales)
-- y se otorga SELECT sobre las vistas. Ver 002.

-- Recomendado adicionalmente:
--  · Snapshot manual de RDS antes de correr cualquier migración.
--  · Probar primero en una copia (restore del snapshot) / entorno staging.
