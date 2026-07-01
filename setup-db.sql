-- Script di Inizializzazione PostgreSQL per Placid
-- Esegui questo script come superuser (es: utente 'postgres')

-- 1. Creazione del database 'placidDb'
CREATE DATABASE "placidDb";

-- 2. Creazione dell'utente 'placidUser'
-- NOTA: Sostituisci 'ScegliUnaPasswordSicura123!' con la password desiderata.
CREATE USER "placidUser" WITH PASSWORD 'ScegliUnaPasswordSicura123!';

-- 3. Concessione di tutti i privilegi sul database 'placidDb' all'utente 'placidUser'
GRANT ALL PRIVILEGES ON DATABASE "placidDB" TO "placidUser";

-- 4. Istruzioni per lo schema 'public' (necessario per PostgreSQL 15+ per consentire la creazione di tabelle)
-- Per applicare queste istruzioni, devi prima connetterti al database appena creato:
-- In psql, esegui: \c placidDb
-- Dopodiché esegui i seguenti comandi:
-- GRANT ALL ON SCHEMA public TO "placidUser";
-- ALTER SCHEMA public OWNER TO "placidUser";

-- 5. Creazione della tabella 'users' per gli utenti dinamici
-- Questa tabella viene creata automaticamente all'avvio dell'applicazione.
-- Se preferisci crearla manualmente, esegui:
-- \c placidDb
-- CREATE TABLE IF NOT EXISTS users (
--   id SERIAL PRIMARY KEY,
--   username VARCHAR(255) NOT NULL UNIQUE,
--   password_hash VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- 6. Creazione della tabella 'consultations' per le consulenze
-- Questa tabella viene creata automaticamente all'avvio dell'applicazione.
-- Se preferisci crearla manualmente, esegui:
-- \c placidDb
-- CREATE TABLE IF NOT EXISTS consultations (
--   id SERIAL PRIMARY KEY,
--   contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
--   consultation_date DATE NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );


