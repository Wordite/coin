--
-- PostgreSQL database dump
--

\restrict tu5umfqNZfP0nPdyslgmhBJmSR3vQE8bnbtEbtzkm22InV58BElB7AAT6s6uG9N

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

-- Started on 2025-10-23 19:51:54 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS mydb;
--
-- TOC entry 3582 (class 1262 OID 16694)
-- Name: mydb; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE mydb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


\unrestrict tu5umfqNZfP0nPdyslgmhBJmSR3vQE8bnbtEbtzkm22InV58BElB7AAT6s6uG9N
\connect mydb
\restrict tu5umfqNZfP0nPdyslgmhBJmSR3vQE8bnbtEbtzkm22InV58BElB7AAT6s6uG9N

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 16994)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 3583 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 880 (class 1247 OID 17190)
-- Name: CoinStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CoinStatus" AS ENUM (
    'PRESALE',
    'SOLD',
    'ACTIVE'
);


--
-- TOC entry 883 (class 1247 OID 17198)
-- Name: DocType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DocType" AS ENUM (
    'DOCUMENT',
    'CATEGORY'
);


--
-- TOC entry 886 (class 1247 OID 17204)
-- Name: FieldType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FieldType" AS ENUM (
    'CONTENT',
    'IMAGES',
    'MARKDOWN',
    'COMPLEX'
);


--
-- TOC entry 862 (class 1247 OID 17058)
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'MANAGER',
    'ADMIN'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 214 (class 1259 OID 16995)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 217 (class 1259 OID 17023)
-- Name: activation_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activation_links (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    is_sent boolean DEFAULT false NOT NULL,
    link text NOT NULL,
    authorization_request_id text
);


--
-- TOC entry 218 (class 1259 OID 17100)
-- Name: authorization_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.authorization_requests (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    activation_link_id text,
    is_registration boolean DEFAULT false NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 17247)
-- Name: coin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coin (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    status public."CoinStatus" DEFAULT 'PRESALE'::public."CoinStatus" NOT NULL,
    sold_amount double precision DEFAULT 0 NOT NULL,
    current_amount double precision DEFAULT 0 NOT NULL,
    total_amount double precision DEFAULT 0 NOT NULL,
    stage integer DEFAULT 0 NOT NULL,
    name text DEFAULT 'Coin'::text NOT NULL,
    decimals integer DEFAULT 6 NOT NULL,
    min_buy_amount double precision DEFAULT 100 NOT NULL,
    max_buy_amount double precision DEFAULT 1000000 NOT NULL,
    mint_address text,
    rpc text DEFAULT 'https://api.mainnet-beta.solana.com'::text NOT NULL,
    read_rate_limit integer DEFAULT 50 NOT NULL,
    rpc_endpoints jsonb,
    write_rate_limit integer DEFAULT 3 NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 17264)
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    fingerprint text NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 17233)
-- Name: docs_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.docs_config (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    title text DEFAULT 'My Site'::text NOT NULL,
    tagline text DEFAULT 'Dinosaurs are cool'::text NOT NULL,
    navbar_title text DEFAULT 'My Site'::text NOT NULL,
    navbar_logo_src text DEFAULT 'img/logo.svg'::text NOT NULL,
    feature1_title text,
    feature1_text text,
    feature1_image text,
    feature2_title text,
    feature2_text text,
    feature2_image text,
    feature3_title text,
    feature3_text text,
    feature3_image text,
    button_text text DEFAULT 'Read More'::text NOT NULL,
    button_link text DEFAULT '/docs'::text NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 17273)
-- Name: documentation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documentation (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    description text,
    is_published boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    type public."DocType" DEFAULT 'DOCUMENT'::public."DocType" NOT NULL,
    category_id text,
    file_path text,
    file_hash text,
    last_synced_at timestamp(3) without time zone,
    is_file_based boolean DEFAULT false NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 17131)
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    filename text NOT NULL,
    original_name text NOT NULL,
    mime_type text NOT NULL,
    size integer NOT NULL,
    path text NOT NULL,
    url text NOT NULL,
    width integer,
    height integer,
    alt text,
    description text
);


--
-- TOC entry 222 (class 1259 OID 17165)
-- Name: section_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.section_fields (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    name text NOT NULL,
    type public."FieldType" NOT NULL,
    description text,
    required boolean DEFAULT false NOT NULL,
    multiple boolean DEFAULT false NOT NULL,
    max_selection integer,
    "defaultValue" text,
    validation jsonb DEFAULT '{}'::jsonb,
    "order" integer DEFAULT 0 NOT NULL,
    section_type_id text NOT NULL,
    text_fields_count integer,
    with_image boolean DEFAULT false NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 17157)
-- Name: section_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.section_types (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT 'default'::text
);


--
-- TOC entry 219 (class 1259 OID 17122)
-- Name: sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sections (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    name text NOT NULL,
    link text NOT NULL,
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    section_type_id text
);


--
-- TOC entry 216 (class 1259 OID 17014)
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "userId" text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    refresh_token text,
    activation_link_id text,
    fingerprint text NOT NULL,
    authorization_request_id text,
    is_activated boolean DEFAULT false NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 17221)
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    site_name text DEFAULT 'CryptoHomayak'::text NOT NULL,
    site_logo text,
    site_description text,
    presale_end_date_time timestamp(3) without time zone,
    presale_active boolean DEFAULT false NOT NULL,
    usdt_to_coin_rate double precision DEFAULT 0.001 NOT NULL,
    sol_to_coin_rate double precision DEFAULT 0.0001 NOT NULL
);


--
-- TOC entry 215 (class 1259 OID 17004)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    email text,
    password text,
    wallet_address text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    transactions jsonb DEFAULT '[]'::jsonb
);


--
-- TOC entry 3569 (class 0 OID 16995)
-- Dependencies: 214
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e992080d-a2ec-4ccb-8664-391a13cb4ee7	4a1020eef7e1fb8337c62e07014ff2ae8ded7b3c072a7e93794563b84871a84f	2025-10-16 22:08:44.214882+00	20250822022016_initial	\N	\N	2025-10-16 22:08:44.168142+00	1
1a0b9ff1-e081-4796-a2f0-dc22c6b21d98	01cc3a10cc4a4f8376a5781cb8a059c17482f8e4172d6147a7859a567af9bca5	2025-10-16 22:08:44.391208+00	20251009200744_add_coin_and_settings_and_sync_schema	\N	\N	2025-10-16 22:08:44.343594+00	1
262cb615-18d6-4f7e-a21f-850f177dbeef	293b402dffc736227fcb750dc060190e181ca56c34f08ef2ea36fb158ff0c37f	2025-10-16 22:08:44.221879+00	20250822193335_fix_session	\N	\N	2025-10-16 22:08:44.216148+00	1
200766a1-d297-4378-ac5d-358dc11c021c	4a1020eef7e1fb8337c62e07014ff2ae8ded7b3c072a7e93794563b84871a84f	2025-10-13 18:34:22.108507+00	20250822022016_initial	\N	\N	2025-10-13 18:34:21.986376+00	1
6526af51-b4b5-473a-8d9f-42e921062590	1c5c0088eacb046d5a3cfc6f1b7c52e638527e6eb3c2d993ace501adff875ce9	2025-10-16 22:08:44.242449+00	20250823203428_added_registration_request	\N	\N	2025-10-16 22:08:44.223004+00	1
bc7df9ee-7b50-43b3-8e07-644640f4e351	01cc3a10cc4a4f8376a5781cb8a059c17482f8e4172d6147a7859a567af9bca5	2025-10-13 18:34:22.791491+00	20251009200744_add_coin_and_settings_and_sync_schema	\N	\N	2025-10-13 18:34:22.609306+00	1
c3a10937-765d-4c75-8f9c-6cf55f021cd0	9e0428e67f72e21d9dc730ab91fecd25d8421c0d4cf43f82fa9c331632303de8	2025-10-16 22:08:44.253791+00	20250823204242_changed_relations	\N	\N	2025-10-16 22:08:44.243731+00	1
05f511a7-0a4a-41b0-aa25-a3ffc5144ad6	293b402dffc736227fcb750dc060190e181ca56c34f08ef2ea36fb158ff0c37f	2025-10-13 18:34:22.134063+00	20250822193335_fix_session	\N	\N	2025-10-13 18:34:22.112768+00	1
7b83bb77-9e68-4e56-94ba-1035778acea6	37cc5c3185e55ed0231d03ccf33cac63efeec3b68fe83f387e62df80df9b92de	2025-10-16 22:08:44.263285+00	20250823204930_changed_relations	\N	\N	2025-10-16 22:08:44.255283+00	1
2b1e5c0e-5097-49de-afb3-1f2e379868d2	1c5c0088eacb046d5a3cfc6f1b7c52e638527e6eb3c2d993ace501adff875ce9	2025-10-13 18:34:22.207981+00	20250823203428_added_registration_request	\N	\N	2025-10-13 18:34:22.138812+00	1
0083bed7-259f-42fb-b02e-96f7e0eee0b6	0f99cd66c84c745a0f1744ed4068f9e981c009f71295415b78fcd4b221576e0f	2025-10-16 22:08:44.268559+00	20250823205049_y	\N	\N	2025-10-16 22:08:44.264688+00	1
cee2b5bd-9410-47c1-8a87-a3579ce38e20	9e0428e67f72e21d9dc730ab91fecd25d8421c0d4cf43f82fa9c331632303de8	2025-10-13 18:34:22.239631+00	20250823204242_changed_relations	\N	\N	2025-10-13 18:34:22.212306+00	1
bfc1f8c8-a3a9-4a83-aa8c-1d6077cb9085	93acde0c76851b130b90d4d25c2826eaae17c24f13acfba1c6b8508764881e19	2025-10-16 22:08:44.288992+00	20250823215912_little_changes	\N	\N	2025-10-16 22:08:44.269808+00	1
6bc4bcaa-aff5-4a59-8bce-afc8bb43496c	37cc5c3185e55ed0231d03ccf33cac63efeec3b68fe83f387e62df80df9b92de	2025-10-13 18:34:22.268845+00	20250823204930_changed_relations	\N	\N	2025-10-13 18:34:22.244394+00	1
f8fb86fc-a885-4798-82d0-911bd28c74a5	64f3b8b3c3e13e31eecddd6dca24fa64eedd2f392cfa7adc58457e113711dde9	2025-10-16 22:08:44.293803+00	20250823230017_fix_session	\N	\N	2025-10-16 22:08:44.290031+00	1
6fb8f868-c3fd-408a-acb3-893329d58c5f	0f99cd66c84c745a0f1744ed4068f9e981c009f71295415b78fcd4b221576e0f	2025-10-13 18:34:22.285846+00	20250823205049_y	\N	\N	2025-10-13 18:34:22.272949+00	1
f4f4b3b8-c3a7-4cd2-baa2-2e04be4d7f81	fadc279fee93a7e7b35aa9c01f2dc3a4bc4e02095a66bdc5ff9ac27905c84905	2025-10-16 22:08:44.298054+00	20250825223541_added	\N	\N	2025-10-16 22:08:44.294754+00	1
0518cbc8-8bd8-4eeb-a898-63c6fe5bdf8c	93acde0c76851b130b90d4d25c2826eaae17c24f13acfba1c6b8508764881e19	2025-10-13 18:34:22.361147+00	20250823215912_little_changes	\N	\N	2025-10-13 18:34:22.28992+00	1
39ec13e2-1fa5-4a72-800b-de0d31924e18	14ac621c1c0ca8efbdb7351d2424a9fc5a2e58a8bfb63471a75f1aeea4eea864	2025-10-16 22:08:44.315496+00	20250827221035_add_media_table	\N	\N	2025-10-16 22:08:44.298901+00	1
031485b8-49b4-47ec-a99d-99c01b835e8d	64f3b8b3c3e13e31eecddd6dca24fa64eedd2f392cfa7adc58457e113711dde9	2025-10-13 18:34:22.378548+00	20250823230017_fix_session	\N	\N	2025-10-13 18:34:22.365574+00	1
fd85bb60-24ef-4f3f-ac2d-8109e1f80aef	e9bfc39ef0bb3b6c402873c6ac5b00505b0887ea69d26a909a238202a65f602a	2025-10-16 22:08:44.333708+00	20250830223357_add_section_types	\N	\N	2025-10-16 22:08:44.316449+00	1
278ec85f-7107-482f-a5cd-4bbccfcf3455	fadc279fee93a7e7b35aa9c01f2dc3a4bc4e02095a66bdc5ff9ac27905c84905	2025-10-13 18:34:22.396302+00	20250825223541_added	\N	\N	2025-10-13 18:34:22.382933+00	1
9112c2c9-ffb8-434c-99d2-d46c7a36be13	63a6038637fc8ef0f2afac93087fbe999131003bd5c6fdeff7a940f8c61f73e9	2025-10-16 22:08:44.338287+00	20250830230906_add_color_and_icon_to_section_types	\N	\N	2025-10-16 22:08:44.334801+00	1
e541489f-2e0f-44c6-a694-337ab45e6e50	14ac621c1c0ca8efbdb7351d2424a9fc5a2e58a8bfb63471a75f1aeea4eea864	2025-10-13 18:34:22.492404+00	20250827221035_add_media_table	\N	\N	2025-10-13 18:34:22.400798+00	1
8db18281-27d7-4f00-abaf-9df68dfc02ab	4aba3c1deabaea6c3d7ba1e8a89860f5073dd0059daa6a3b7d919d7e7464cd81	2025-10-16 22:08:44.342624+00	20250830232130_remove_icon_from_section_types	\N	\N	2025-10-16 22:08:44.339402+00	1
fd3b7a7b-0c7d-40ac-9f8b-f5ad78fe2976	e9bfc39ef0bb3b6c402873c6ac5b00505b0887ea69d26a909a238202a65f602a	2025-10-13 18:34:22.569243+00	20250830223357_add_section_types	\N	\N	2025-10-13 18:34:22.496835+00	1
7d01aebf-e6a2-4bc1-9093-a28effc08c03	63a6038637fc8ef0f2afac93087fbe999131003bd5c6fdeff7a940f8c61f73e9	2025-10-13 18:34:22.586929+00	20250830230906_add_color_and_icon_to_section_types	\N	\N	2025-10-13 18:34:22.573818+00	1
ff7c525a-c923-4ed6-a5f5-edc75a1296b9	4aba3c1deabaea6c3d7ba1e8a89860f5073dd0059daa6a3b7d919d7e7464cd81	2025-10-13 18:34:22.604842+00	20250830232130_remove_icon_from_section_types	\N	\N	2025-10-13 18:34:22.591296+00	1
6135882d-bb1e-4ede-a718-90ce7ba153a3	4b73690eeb7bbfdb074e000a0c169cf6cb860ba26bcb0e2f855c251f578cad98	2025-10-21 20:01:47.555357+00	20251021151904_add_rpc_in_coin_table	\N	\N	2025-10-21 20:01:47.526813+00	1
f3ca8337-05db-463e-a4fe-a35a6e6b8edf	6cbd71d7f7da41082c14c3decbc1a728bb1fce96a25c185772cbf7576c999a58	2025-10-21 20:01:47.567155+00	20251021190601_add_rpc_in_coin_table	\N	\N	2025-10-21 20:01:47.557483+00	1
\.


--
-- TOC entry 3575 (class 0 OID 17247)
-- Dependencies: 225
-- Data for Name: coin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coin (id, created_at, updated_at, status, sold_amount, current_amount, total_amount, stage, name, decimals, min_buy_amount, max_buy_amount, mint_address, rpc, read_rate_limit, rpc_endpoints, write_rate_limit) FROM stdin;
cmfe5kk680006gp640wlf9ux2	2025-09-10 15:47:08.96	2025-10-22 21:48:24.802	PRESALE	600	49400	50000	1	Coin	6	100	1000000	DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263	https://mainnet.helius-rpc.com/?api-key=9d0fb0ab-0a16-4029-84eb-667b87e2ca46	50	[{"url": "https://api.mainnet-beta.solana.com", "name": "solana", "priority": 1}]	3
\.


--
-- TOC entry 3574 (class 0 OID 17233)
-- Dependencies: 224
-- Data for Name: docs_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.docs_config (id, created_at, updated_at, title, tagline, navbar_title, navbar_logo_src, feature1_title, feature1_text, feature1_image, feature2_title, feature2_text, feature2_image, feature3_title, feature3_text, feature3_image, button_text, button_link) FROM stdin;
cmffz0f480000gp7bj5wpqtdu	2025-09-11 22:19:03.945	2025-10-21 10:53:23.503	Documentation of Coin	Docs of Coin	Coin	/uploads/5ac2b67c-9b0e-4c76-8ef0-4ad99cb716c0.svg	Feature 1	This is good	/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg	Feature 2	Very nice!!!	/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg	Feature 3	Impressive Coin!!!!	/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg	Get Started	/docs
\.


--
-- TOC entry 3576 (class 0 OID 17273)
-- Dependencies: 227
-- Data for Name: documentation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documentation (id, created_at, updated_at, title, slug, content, description, is_published, "order", type, category_id, file_path, file_hash, last_synced_at, is_file_based) FROM stdin;
\.


--
-- TOC entry 3572 (class 0 OID 17165)
-- Dependencies: 222
-- Data for Name: section_fields; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.section_fields (id, created_at, updated_at, name, type, description, required, multiple, max_selection, "defaultValue", validation, "order", section_type_id, text_fields_count, with_image) FROM stdin;
cmf2wlwnp0007gpyk5qgm4tp0	2025-09-02 18:50:47.316	2025-09-02 18:50:47.316	title	CONTENT	Title of section	f	f	\N	What makes Us different	{}	0	cmf2wlwno0006gpykhdyxyf68	\N	f
cmf2wlwnp0008gpykbiwl0b5f	2025-09-02 18:50:47.316	2025-09-02 18:50:47.316	benefits	COMPLEX	Different items with title, description and icon	f	t	3		{"imageLabel": "Icon", "enableImage": true, "firstInputLabel": "Title", "enableFirstInput": true, "secondInputLabel": "Description", "enableSecondInput": true}	1	cmf2wlwno0006gpykhdyxyf68	2	f
cmf2wnrex000bgpyki2ip0bu1	2025-09-02 18:52:13.832	2025-09-02 18:52:13.832	title	CONTENT	Header of section	t	f	\N	What is Coin?	{}	0	cmf1jmpn7000agpn0snhmqjhw	\N	f
cmf2wnrex000cgpykf66z2q0h	2025-09-02 18:52:13.832	2025-09-02 18:52:13.832	subtitle	CONTENT	Header of section	t	f	\N	Join the presale and become part of the future of decentralized finance. Get early access to an innovative DeFi platform with instant transactions.	{}	1	cmf1jmpn7000agpn0snhmqjhw	\N	f
cmf2wnrex000dgpykinowopmu	2025-09-02 18:52:13.832	2025-09-02 18:52:13.832	images	IMAGES	Recommended size 340x290	t	t	4	f	{}	2	cmf1jmpn7000agpn0snhmqjhw	\N	f
cmf2wnrex000egpyk4bjctrxx	2025-09-02 18:52:13.832	2025-09-02 18:52:13.832	infos	COMPLEX	benefits list with title, subtitle and icon 24x19	f	t	5		{"imageLabel": "icon", "enableImage": true, "firstInputLabel": "title", "secondInputLabel": "text", "enableSecondInput": true}	3	cmf1jmpn7000agpn0snhmqjhw	\N	f
cmf3349to000hgpto6qxhyk5e	2025-09-02 21:53:01.884	2025-09-02 21:53:01.884	title	CONTENT	Title of section	t	f	\N	Staking	{}	0	cmf3264ij0000gptomu9q6kwf	\N	f
cmf3349to000igptoavzf19al	2025-09-02 21:53:01.884	2025-09-02 21:53:01.884	subtitle	CONTENT	subtitle under title of section	t	f	\N	Choose your staking tier and see how many coins you can earn based on lock-up duration and APY	{}	1	cmf3264ij0000gptomu9q6kwf	\N	f
cmf3349to000jgptovpbi3s82	2025-09-02 21:53:01.884	2025-09-02 21:53:01.884	tiers	COMPLEX	Staking APY tiers	f	t	5		{"imageLabel": "Icon", "enableImage": false, "firstInputLabel": "name", "textField3Label": "apy", "enableFirstInput": true, "enableTextField4": false, "secondInputLabel": "lockup", "enableSecondInput": true}	2	cmf3264ij0000gptomu9q6kwf	3	f
cmf3349to000kgpto0z59oxz2	2025-09-02 21:53:01.884	2025-09-02 21:53:01.884	stakingPoolLink	CONTENT	URL of button 'Staking Pool'	t	f	\N	/	{}	3	cmf3264ij0000gptomu9q6kwf	\N	f
cmf3494n3000qgpto2qvs1r6x	2025-09-02 22:24:48.063	2025-09-02 22:24:48.063	title	CONTENT	title of section	f	f	\N	Tokenomics	{}	0	cmf33z2id000lgptodkt9767u	\N	f
cmf3494n3000rgptoyoazi2l6	2025-09-02 22:24:48.063	2025-09-02 22:24:48.063	piechart	COMPLEX	Items of piechart. Color in hex (#ff0000)	f	t	20		{"imageLabel": "Icon", "enableImage": false, "firstInputLabel": "name", "textField3Label": "color", "textField4Label": "countOfTokens", "enableFirstInput": true, "secondInputLabel": "percentage", "enableSecondInput": true}	1	cmf33z2id000lgptodkt9767u	4	f
cmf4kc5d90001gp0hjia8b2cu	2025-09-03 22:42:49.004	2025-09-03 22:42:49.004	title	CONTENT	Title of section	t	f	\N	Presale Details	{}	0	cmf4kc5d80000gp0hryc6hxo0	\N	f
cmf4kc5d90002gp0hw4ojjmr1	2025-09-03 22:42:49.004	2025-09-03 22:42:49.004	subtitle	CONTENT	Subtitle of section	t	f	\N	Our presale details are outlined below, including the soft and hard caps, as well asthe different stages for participation.	{}	1	cmf4kc5d80000gp0hryc6hxo0	\N	f
cmf4kc5d90003gp0hlhkvmp6m	2025-09-03 22:42:49.004	2025-09-03 22:42:49.004	details	COMPLEX	Details cards	f	t	5		{"imageLabel": "Icon", "enableImage": false, "firstInputLabel": "title", "enableFirstInput": true, "secondInputLabel": "text", "enableSecondInput": true}	2	cmf4kc5d80000gp0hryc6hxo0	2	f
cmf4n8b1f0007gp0hhqfd2mdx	2025-09-04 00:03:48.579	2025-09-04 00:03:48.579	title	CONTENT	Title of section	t	f	\N	Stages & Pricing	{}	0	cmf4n8b1f0006gp0h3zqsserv	\N	f
cmf4n8b1f0008gp0h49ie7iuh	2025-09-04 00:03:48.579	2025-09-04 00:03:48.579	stages	COMPLEX	Stages and pricing array of cards	f	t	5		{"imageLabel": "Icon", "enableImage": false, "firstInputLabel": "title", "textField3Label": "countOfTokens", "enableFirstInput": true, "secondInputLabel": "price", "enableSecondInput": true}	1	cmf4n8b1f0006gp0h3zqsserv	3	f
cmf4nm63u000bgp0hp13sts8p	2025-09-04 00:14:35.37	2025-09-04 00:14:35.37	title	CONTENT	Hero section on homepage title	t	f	\N	The revolutionary DeFi ecosystem on Solana	{}	0	cmeyxho6j0000gp7khhck5suz	\N	f
cmf4nm63u000cgp0hbp6t0b1d	2025-09-04 00:14:35.37	2025-09-04 00:14:35.37	subtitle	CONTENT	Hero section subtitle	t	f	\N	Join the presale and become part of the future of decentralized finance. Get early access to an innovative DeFi platform with instant transactions.	{}	1	cmeyxho6j0000gp7khhck5suz	\N	f
cmf4nm63u000dgp0h3y3il37p	2025-09-04 00:14:35.37	2025-09-04 00:14:35.37	videoUrl	CONTENT	URL of Video Intro button	t	f	\N	https://www.youtube.com/watch?v=UDVtMYqUAyw&list=RDUDVtMYqUAyw&start_radio=1	{}	2	cmeyxho6j0000gp7khhck5suz	\N	f
cmf4o7xnk000fgp0hiopp0da3	2025-09-04 00:31:30.848	2025-09-04 00:31:30.848	title	CONTENT	Titel of section	t	f	\N	Roadmap	{}	0	cmf4o7xnk000egp0hnlxvksmf	\N	f
cmf4o7xnk000ggp0h4ezdbnqd	2025-09-04 00:31:30.848	2025-09-04 00:31:30.848	list	COMPLEX		f	t	4		{"imageLabel": "Icon", "enableImage": false, "firstInputLabel": "title", "enableFirstInput": true, "secondInputLabel": "text", "enableSecondInput": true}	1	cmf4o7xnk000egp0hnlxvksmf	2	f
cmf4o7xnk000hgp0hhx07kv78	2025-09-04 00:31:30.848	2025-09-04 00:31:30.848	link	CONTENT	link on full roadmap	f	f	\N	/	{}	2	cmf4o7xnk000egp0hnlxvksmf	\N	f
cmf4p8l6d000lgp0hf2dz0vbq	2025-09-04 01:00:00.949	2025-09-04 01:00:00.949	images	IMAGES	images 320x70	f	t	15		{}	0	cmf4p8l6d000kgp0hevn6yyuz	\N	f
cmf5gy5ms0000gp3k2kl2b3os	2025-09-04 13:55:43.493	2025-09-04 13:55:43.493	contactInfo	COMPLEX	This is 3 links right at contact form with icons (svg only)	f	t	3		{"imageLabel": "icon", "enableImage": true, "firstInputLabel": "text", "enableFirstInput": true, "secondInputLabel": "link", "enableSecondInput": true}	0	cmf5dkg8s0000gppvak83i2fi	2	f
cmf5gy5ms0001gp3k74dwadhc	2025-09-04 13:55:43.493	2025-09-04 13:55:43.493	socails	COMPLEX	This is icons with links located under contact info lniks right contact form and in footer 3 icons (svg only)	f	t	3		{"imageLabel": "Icon", "enableImage": true, "firstInputLabel": "link", "enableFirstInput": true, "secondInputLabel": "Description", "enableSecondInput": false}	1	cmf5dkg8s0000gppvak83i2fi	2	f
cmf5gy5ms0002gp3k6r0aonra	2025-09-04 13:55:43.493	2025-09-04 13:55:43.493	title	CONTENT	Title of Contact section	f	f	\N	Contact Us	{}	2	cmf5dkg8s0000gppvak83i2fi	\N	f
cmf5hkais0004gp3k7t1acs30	2025-09-04 14:12:56.26	2025-09-04 14:12:56.26	title	CONTENT	Title of section	t	f	\N	FAQ	{}	0	cmf5hkais0003gp3k8y3nvon7	\N	f
cmf5hkait0005gp3k58v9vmbc	2025-09-04 14:12:56.26	2025-09-04 14:12:56.26	subtitle	CONTENT	section subtitle	t	f	\N	Frequently Asked Questions	{}	1	cmf5hkais0003gp3k8y3nvon7	\N	f
cmf5hkait0006gp3ka5fahmgl	2025-09-04 14:12:56.26	2025-09-04 14:12:56.26	questions	COMPLEX	Questions and answers in FAQ	f	t	10		{"imageLabel": "Icon", "enableImage": false, "firstInputLabel": "question", "enableFirstInput": true, "secondInputLabel": "answer", "enableSecondInput": true}	2	cmf5hkais0003gp3k8y3nvon7	2	f
cmf5m3jel0006gpb87uiuu829	2025-09-04 16:19:52.702	2025-09-04 16:19:52.702	firstLinksSectionName	CONTENT	Name of first left links row in footer	t	f	\N	Info	{}	0	cmf5jfk6m0009gp3kl6ytgksi	\N	f
cmf5m3jel0007gpb8wysng74p	2025-09-04 16:19:52.702	2025-09-04 16:19:52.702	firstLinksSectionRow	COMPLEX	Links in first link row in footer	f	t	4		{"imageLabel": "Icon", "enableImage": false, "firstInputLabel": "text", "enableFirstInput": true, "secondInputLabel": "link", "enableSecondInput": true}	1	cmf5jfk6m0009gp3kl6ytgksi	2	f
cmf5m3jel0008gpb8e02c11xc	2025-09-04 16:19:52.702	2025-09-04 16:19:52.702	secondLinksSectionName	CONTENT	second links row in footer name	t	f	\N	Finance	{}	2	cmf5jfk6m0009gp3kl6ytgksi	\N	f
cmf5m3jel0009gpb8dez9j9kp	2025-09-04 16:19:52.702	2025-09-04 16:19:52.702	secondLinksSectionRow	COMPLEX	second links in first link row in footer	f	t	4		{"imageLabel": "Icon", "enableImage": false, "firstInputLabel": "text", "enableFirstInput": true, "secondInputLabel": "link", "enableSecondInput": true}	3	cmf5jfk6m0009gp3kl6ytgksi	2	f
cmf5m3jel000agpb80s47wstv	2025-09-04 16:19:52.702	2025-09-04 16:19:52.702	rightBottomText	CONTENT	right bottom text in footer	f	f	\N	Copyright © 2025 CryptoHomayak. All rights reserved. Some words here.	{}	4	cmf5jfk6m0009gp3kl6ytgksi	\N	f
cmf5m3jel000bgpb86yr8rngj	2025-09-04 16:19:52.702	2025-09-04 16:19:52.702	contractAddress	CONTENT	contract address	f	f	\N	DRay6fNdQ5J82H7xV6uq2aV3mNrUZ1J4PgSKsWgptcm6	{}	5	cmf5jfk6m0009gp3kl6ytgksi	\N	f
cmgs36v4u0005oi0tj92jfncv	2025-10-15 14:28:59.551	2025-10-15 14:28:59.551	links	COMPLEX	List of links in header	f	t	6		{"imageLabel": "Icon", "enableImage": false, "firstInputLabel": "label", "enableFirstInput": true, "secondInputLabel": "url", "enableSecondInput": true}	0	cmgs36v4u0004oi0tgybeyv5w	2	f
cmgsbr30b0009oi0tgdcrt5g0	2025-10-15 18:28:39.803	2025-10-15 18:28:39.803	widgetTitle	CONTENT	title o widget	f	f	\N	Presale	{}	0	cmgsbr30b0008oi0tt9e8atwv	\N	f
cmgsbr30b000aoi0t4miv9hne	2025-10-15 18:28:39.803	2025-10-15 18:28:39.803	presaleEndTitle	CONTENT	Title of presale end widget (it's show when presale ended)	f	f	\N	Presale ended	{}	1	cmgsbr30b0008oi0tt9e8atwv	\N	f
cmgsbr30b000boi0tdfmre09i	2025-10-15 18:28:39.803	2025-10-15 18:28:39.803	presaleEndText	CONTENT	text	f	f	\N	Presale ended text yohoooo!!!	{}	2	cmgsbr30b0008oi0tt9e8atwv	\N	f
cmgsbr30b000coi0ts2n6rh9j	2025-10-15 18:28:39.803	2025-10-15 18:28:39.803	presaleEndButton	COMPLEX		f	t	1		{"imageLabel": "Icon", "enableImage": false, "firstInputLabel": "label", "enableFirstInput": true, "secondInputLabel": "url", "enableSecondInput": true}	3	cmgsbr30b0008oi0tt9e8atwv	2	f
cmgtk43pt0001oi0t7z12g51a	2025-10-16 15:10:30.353	2025-10-16 15:10:30.353	content	MARKDOWN	Content of about page	f	f	\N		{}	0	cmgtk43pt0000oi0tb787m45z	\N	f
cmgtkbc7v0005oi0tlt2r24di	2025-10-16 15:16:07.963	2025-10-16 15:16:07.963	content	MARKDOWN	content	f	f	\N		{}	0	cmgtkbc7v0004oi0t2lr9krcj	\N	f
\.


--
-- TOC entry 3571 (class 0 OID 17157)
-- Dependencies: 221
-- Data for Name: section_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.section_types (id, created_at, updated_at, name, description, color) FROM stdin;
cmf2wlwno0006gpykhdyxyf68	2025-09-02 18:50:47.316	2025-09-02 18:50:47.316	WhatMakesUsDifferent	What makes Us different after what is coin	secondary
cmf1jmpn7000agpn0snhmqjhw	2025-09-01 19:59:43.699	2025-09-02 18:52:13.832	WhatIsCoin	Second section of homepage after hero	success
cmf3264ij0000gptomu9q6kwf	2025-09-02 21:26:28.699	2025-09-02 21:53:01.884	Staking	Staking section after makes us different	primary
cmf33z2id000lgptodkt9767u	2025-09-02 22:16:58.741	2025-09-02 22:24:48.063	Tokenomics	Tokenomics section	warning
cmf4kc5d80000gp0hryc6hxo0	2025-09-03 22:42:49.004	2025-09-03 22:42:49.004	PresaleDetails	Presale Details section on homepage	primary
cmf4n8b1f0006gp0h3zqsserv	2025-09-04 00:03:48.579	2025-09-04 00:03:48.579	StagesAndPricing	Stages and pricing section	success
cmeyxho6j0000gp7khhck5suz	2025-08-31 00:04:24.62	2025-09-04 00:14:35.37	Hero	Main hero section with title, subtitle, and background image	primary
cmf4o7xnk000egp0hnlxvksmf	2025-09-04 00:31:30.848	2025-09-04 00:31:30.848	Roadmap		secondary
cmf4p8l6d000kgp0hevn6yyuz	2025-09-04 01:00:00.949	2025-09-04 01:00:00.949	Partners	partners image auto slider section on homepage	danger
cmf5dkg8s0000gppvak83i2fi	2025-09-04 12:21:05.204	2025-09-04 13:55:43.493	Social Media Links and Contact	Social Media Links	danger
cmf5hkais0003gp3k8y3nvon7	2025-09-04 14:12:56.26	2025-09-04 14:12:56.26	FAQ	FAQ section	default
cmf5jfk6m0009gp3kl6ytgksi	2025-09-04 15:05:14.734	2025-09-04 16:19:52.702	Footer	Footer section in down page	default
cmgs36v4u0004oi0tgybeyv5w	2025-10-15 14:28:59.551	2025-10-15 14:28:59.551	HeaderLinks	Header links	default
cmgsbr30b0008oi0tt9e8atwv	2025-10-15 18:28:39.803	2025-10-15 18:28:39.803	PurchaseCoins		default
cmgtk43pt0000oi0tb787m45z	2025-10-16 15:10:30.353	2025-10-16 15:10:30.353	About Page	About page	default
cmgtkbc7v0004oi0t2lr9krcj	2025-10-16 15:16:07.963	2025-10-16 15:16:07.963	Privacy Policy Page	Page privacy policy	default
\.


--
-- TOC entry 3570 (class 0 OID 17122)
-- Dependencies: 219
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sections (id, created_at, updated_at, name, link, content, section_type_id) FROM stdin;
cmf1413jc0004gput5m0kddgw	2025-09-01 12:43:01.031	2025-09-04 12:46:14.043	Hero Section	hero	{"title": "The revolutionary DeFi ecosystem on Solana", "subtitle": "Join the presale and become part of the future of decentralized finance. Get early access to an innovative DeFi platform with instant transactions.", "videoUrl": "https://www.youtube.com/watch?v=UDVtMYqUAyw&list=RDUDVtMYqUAyw&start_radio=1"}	cmeyxho6j0000gp7khhck5suz
cmf3264k70004gpto4undxw0p	2025-09-02 21:26:28.76	2025-09-02 22:01:21.452	Staking	staking	{"tiers": [{"textField1": "Bronze", "textField2": "2 months lock-up", "textField3": "10%-12% APY"}, {"textField1": "Silver", "textField2": "3 months lock-up", "textField3": "10%-12% APY"}, {"textField1": "Gold", "textField2": "4 months lock-up", "textField3": "10%-12% APY"}, {"textField1": "Platinum", "textField2": "5 months lock-up", "textField3": "10%-12% APY"}, {"textField1": "Diamond", "textField2": "6 months lock-up", "textField3": "10%-12% APY"}], "title": "Staking", "subtitle": "Choose your staking tier and see how many coins you can earn based on lock-up duration and APY", "stakingPoolLink": "/"}	cmf3264ij0000gptomu9q6kwf
cmf4n8b3o000agp0he5gb1new	2025-09-04 00:03:48.66	2025-09-04 00:12:06.248	StagesAndPricing	stagesandpricing	{"title": "Stages & Pricing", "stages": [{"textField1": "Stage 1", "textField2": "$0.00355/token", "textField3": "40M Tokens"}, {"textField1": "Stage 2", "textField2": "$0.00355/token", "textField3": "40M Tokens"}, {"textField1": "Stage 3", "textField2": "$0.00355/token", "textField3": "40M Tokens"}, {"textField1": "Stage 4", "textField2": "$0.00355/token", "textField3": "40M Tokens"}, {"textField1": "Stage 5", "textField2": "$0.00355/token", "textField3": "40M Tokens"}]}	cmf4n8b1f0006gp0h3zqsserv
cmf33z2kg000ogptoez2brcwo	2025-09-02 22:16:58.816	2025-09-02 22:24:55.689	Tokenomics	tokenomics	{"title": "Tokenomics", "piechart": [{"textField1": "Presale", "textField2": "60", "textField3": "#00ff00", "textField4": "100,000"}, {"textField1": "Liquidity", "textField2": "10", "textField3": "#ff6b6b", "textField4": "1,000,000"}, {"textField1": "Treasury & Growth", "textField2": "2", "textField3": "#45b7d1", "textField4": "1,000,000"}, {"textField1": "Team & Advisors", "textField2": "10", "textField3": "#2BD59D", "textField4": "1,000,000"}, {"textField1": "Community rewards", "textField2": "13", "textField3": "#D29D0D", "textField4": "100,000"}, {"textField1": "Ecosystem", "textField2": "5", "textField3": "#45b7d1", "textField4": "30,000"}]}	cmf33z2id000lgptodkt9767u
cmf4kc5f10005gp0hwd20dwe3	2025-09-03 22:42:49.07	2025-09-03 22:43:41.227	PresaleDetails	presaledetails	{"title": "Presale Details", "details": [{"textField1": "Start - End", "textField2": "June 20, 2025 (9:00AM GMT) - Hard Cap"}, {"textField1": "Available wallets - Chains", "textField2": "Solflare & Phantom USDT/SOL"}, {"textField1": "Soft Cap - Hard Cap", "textField2": "$50,000 - $1500,500"}], "subtitle": "Our presale details are outlined below, including the soft and hard caps, as well asthe different stages for participation."}	cmf4kc5d80000gp0hryc6hxo0
cmf5dkgar0004gppvpgstkknm	2025-09-04 12:21:05.283	2025-10-19 18:40:47.306	Social Media Links and Contact	social-media-links-contact	{"title": "Contact Us", "socails": [{"image": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "textField1": "/"}, {"image": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "textField1": "/"}, {"image": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "textField1": "/"}], "contactInfo": [{"image": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "textField1": "info@cryptohomyak.com", "textField2": "mailto:someone@example.com"}, {"image": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "textField1": "facebook.com/crpthomyak", "textField2": "https://facebook.com/crpthomyak"}, {"image": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "textField1": "Trident Chambers, P.O. Box 146 Road Town, Tortola, British Virgin Islands VG1110", "textField2": "google.com"}]}	cmf5dkg8s0000gppvak83i2fi
cmf2wlwsc000agpykxgqk6tju	2025-09-02 18:50:47.484	2025-10-19 18:50:13.644	WhatMakesUsDifferent	whatmakesusdifferent	{"title": "What makes Us different", "benefits": [{"image": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "textField1": "Fast Transactions", "textField2": "Experience the future of finance with tools like staking, lending, and borrowing."}, {"image": "/uploads/076466ee-d624-40a2-a6df-f22fd9c83792.svg", "textField1": "Low Fees", "textField2": "Experience the future of finance with tools like staking, lending, and borrowing."}, {"image": "/uploads/0164cfb7-4653-48c2-ac8e-d063c96c9cd9.svg", "textField1": "Secure", "textField2": "Experience the future of finance with tools like staking, lending, and borrowing."}]}	cmf2wlwno0006gpykhdyxyf68
cmf4o7xq3000jgp0hcz9gq9t3	2025-09-04 00:31:30.94	2025-09-04 00:45:39.52	Roadmap	roadmap	{"link": "/", "list": [{"textField1": " February 2025", "textField2": "Complete the development of Coin platform and ecosystem. Begin internal testing for all features (staking, payments, liquidity pools, etc.)."}, {"textField1": " March 2025", "textField2": "Complete the development of Coin platform and ecosystem. Begin internal testing for all features (staking, payments, liquidity pools, etc.)."}, {"textField1": " April 2025", "textField2": "Complete the development of Coin platform and ecosystem. Begin internal testing for all features (staking, payments, liquidity pools, etc.)."}, {"textField1": "May 2025", "textField2": "Complete the development of Coin platform and ecosystem. Begin internal testing for all features (staking, payments, liquidity pools, etc.)."}], "title": "Roadmap"}	cmf4o7xnk000egp0hnlxvksmf
cmf5hkal80008gp3kqnbx8vj6	2025-09-04 14:12:56.348	2025-09-04 14:15:52.837	FAQ	faq	{"title": "FAQ", "subtitle": "Frequently Asked Questions", "questions": [{"textField1": "What is the purpose of this website?", "textField2": "This website is a platform for users to ask his website is a platform for users to askhis website is a platform for users to askhis website is a platform for users to ask and answer questions. It is a place where users can share their knowledge and help others."}, {"textField1": "How does the presale work?", "textField2": "The presale allows early investors to purchase tokens at a discounted price before the official launch. This helps fund development and rewards early supporters."}, {"textField1": "What is the minimum investment amount?", "textField2": "The minimum investment amount is 0.1 SOL. This ensures accessibility while maintaining reasonable transaction costs."}, {"textField1": "When will the tokens be distributed?", "textField2": "Tokens will be distributed immediately after the presale ends and the smart contract is deployed. You will receive them in your connected wallet."}, {"textField1": "Is there a maximum investment limit?", "textField2": "Yes, there is a maximum investment limit of 50 SOL per wallet to ensure fair distribution among all participants."}, {"textField1": "What happens if the presale doesn't reach its goal?", "textField2": "If the presale doesn't reach its funding goal, all investments will be automatically refunded to participants' wallets."}]}	cmf5hkais0003gp3k8y3nvon7
cmf5jfk8t000hgp3k2t3tubgv	2025-09-04 15:05:14.814	2025-09-04 16:19:52.71	Footer	footer	{"contractAddress": "DRay6fNdQ5J82H7xV6uq2aV3mNrUZ1J4PgSKsWgptcm6", "rightBottomText": "Copyright © 2025 CryptoHomayak. All rights reserved. Some words here.", "firstLinksSectionRow": [{"textField1": "About Us", "textField2": "/about"}, {"textField1": "Presale details", "textField2": "/#presale-details"}, {"textField1": "Roadmap", "textField2": "/#roadmap"}, {"textField1": "Documentation", "textField2": "/docs"}], "firstLinksSectionName": "Info", "secondLinksSectionRow": [{"textField1": "Staking", "textField2": "/#staking"}, {"textField1": "Purchase", "textField2": "/#purchase"}, {"textField1": "Security Audit", "textField2": "/"}, {"textField1": "Contact", "textField2": "/#contact"}], "secondLinksSectionName": "Finance"}	cmf5jfk6m0009gp3kl6ytgksi
cmgs36vbv0007oi0t5d4m1x5d	2025-10-15 14:28:59.804	2025-10-15 18:22:16.585	HeaderLinks	header-links	{"links": [{"textField1": "About us", "textField2": "/about"}, {"textField1": "Documentation", "textField2": "https://docs.tycoin.app"}, {"textField1": "Security audit", "textField2": "/"}, {"textField1": "Staking", "textField2": "/#staking"}]}	cmgs36v4u0004oi0tgybeyv5w
cmgsbr37e000eoi0tfxs6fqrk	2025-10-15 18:28:40.058	2025-10-15 18:29:27.693	PurchaseCoins	purchase-coins	{"widgetTitle": "Presale", "presaleEndText": "Presale ended text yohoooo!!!", "presaleEndTitle": "Presale ended", "presaleEndButton": []}	cmgsbr30b0008oi0tt9e8atwv
cmgtk43xm0003oi0tshizvmmn	2025-10-16 15:10:30.634	2025-10-16 15:13:56.279	About Page	about	{"content": "# 🚀 Welcome to CoinPresale\\n\\n\\n\\n## About Our Revolutionary Token\\n\\n**CoinPresale** is the next generation of cryptocurrency that combines cutting-edge blockchain technology with real-world utility. Our token represents a new era of decentralized finance, offering unprecedented opportunities for investors and users alike.\\n\\n## 🌟 Key Features\\n\\n### 💎 **Advanced Technology**\\n- Built on Solana blockchain for lightning-fast transactions\\n- Smart contract security with multi-layer protection\\n- Cross-chain compatibility for seamless integration\\n\\n### 🎯 **Real-World Utility**\\n- **Payment Solutions**: Use our token for everyday purchases\\n- **Staking Rewards**: Earn passive income through our staking program\\n- **Governance Rights**: Participate in project decisions and development\\n\\n### 🔒 **Security First**\\n- Audited smart contracts by leading security firms\\n- Multi-signature wallet protection\\n- Regular security updates and monitoring\\n\\n## 📊 Tokenomics\\n\\n| Parameter | Value |\\n|-----------|-------|\\n| **Total Supply** | 1,000,000,000 COIN |\\n| **Presale Allocation** | 30% (300,000,000 COIN) |\\n| **Liquidity Pool** | 25% (250,000,000 COIN) |\\n| **Team & Development** | 15% (150,000,000 COIN) |\\n| **Marketing & Partnerships** | 20% (200,000,000 COIN) |\\n| **Reserve Fund** | 10% (100,000,000 COIN) |\\n\\n## 🎯 Presale Stages\\n\\n### **Stage 1: Early Bird** 🐦\\n- **Price**: $0.001 per COIN\\n- **Allocation**: 50,000,000 COIN\\n- **Bonus**: 20% extra tokens\\n\\n### **Stage 2: Community** 👥\\n- **Price**: $0.002 per COIN\\n- **Allocation**: 100,000,000 COIN\\n- **Bonus**: 15% extra tokens\\n\\n### **Stage 3: Public** 🌍\\n- **Price**: $0.005 per COIN\\n- **Allocation**: 150,000,000 COIN\\n- **Bonus**: 10% extra tokens\\n\\n## 🛣️ Roadmap\\n\\n### **Q1 2024** ✅\\n- [x] Smart contract development\\n- [x] Security audits completed\\n- [x] Presale platform launch\\n\\n### **Q2 2024** 🚧\\n- [ ] Token listing on major exchanges\\n- [ ] Mobile wallet application\\n- [ ] Partnership announcements\\n\\n### **Q3 2024** 📅\\n- [ ] DeFi platform launch\\n- [ ] NFT marketplace integration\\n- [ ] Cross-chain bridge deployment\\n\\n### **Q4 2024** 🎯\\n- [ ] Global expansion\\n- [ ] Enterprise solutions\\n- [ ] Community governance launch\\n\\n## 💰 How to Participate\\n\\n1. **Connect Wallet**: Link your Solana wallet to our platform\\n2. **Choose Stage**: Select your preferred presale stage\\n3. **Purchase Tokens**: Buy COIN tokens with SOL or USDT\\n4. **Receive Tokens**: Get your tokens after presale ends\\n\\n## 🔗 Important Links\\n\\n- **Website**: [coinpresale.com](https://coinpresale.com)\\n- **Telegram**: [t.me/coinpresale](https://t.me/coinpresale)\\n- **Twitter**: [@coinpresale](https://twitter.com/coinpresale)\\n- **Discord**: [discord.gg/coinpresale](https://discord.gg/coinpresale)\\n\\n## ⚠️ Disclaimer\\n\\nThis presale is for educational and demonstration purposes. Cryptocurrency investments carry significant risk. Please conduct your own research and invest responsibly.\\n\\n---\\n\\n*Join the future of finance with CoinPresale! 🚀*\\n\\n\\n![](http://localhost:3000/uploads/ddfe8b70-1b78-466f-bf45-be300bbcf227.svg)\\n\\n![](http://localhost:3000/uploads/ddfe8b70-1b78-466f-bf45-be300bbcf227.svg)\\n"}	cmgtk43pt0000oi0tb787m45z
cmgtkbcf20007oi0tw7ndgle7	2025-10-16 15:16:08.223	2025-10-16 15:16:42.524	Privacy Policy Page	privacy-policy	{"content": "# 🔒 Privacy Policy\\n\\n*Last updated: [Date]*\\n\\n## Introduction\\n\\nWelcome to **CoinPresale** (\\"we,\\" \\"our,\\" or \\"us\\"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our presale platform.\\n\\n## 📋 Information We Collect\\n\\n### **Personal Information**\\n- **Email Address**: For account creation and communication\\n- **Wallet Address**: For token transactions and verification\\n- **IP Address**: For security and analytics purposes\\n- **Browser Information**: For fingerprinting and security\\n\\n### **Transaction Data**\\n- **Purchase History**: Records of token purchases\\n- **Payment Methods**: SOL, USDT transaction details\\n- **Amounts**: Token quantities and prices\\n\\n### **Technical Information**\\n- **Device Information**: Browser type, operating system\\n- **Usage Data**: Pages visited, time spent on site\\n- **Cookies**: Session management and preferences\\n\\n## 🍪 Cookie Policy\\n\\n### **Types of Cookies We Use**\\n\\n| Cookie Type | Purpose | Duration |\\n|-------------|---------|----------|\\n| **Essential** | Authentication, security | Session |\\n| **Analytics** | Website performance | 30 days |\\n| **Preferences** | User settings | 90 days |\\n| **Marketing** | Targeted advertising | 1 year |\\n\\n### **Cookie Consent**\\nBy using our website, you consent to our use of cookies. You can manage cookie preferences in your browser settings.\\n\\n## 🔄 How We Use Your Information\\n\\n### **Primary Uses**\\n- ✅ **Account Management**: Create and maintain user accounts\\n- ✅ **Transaction Processing**: Process token purchases and transfers\\n- ✅ **Security**: Prevent fraud and unauthorized access\\n- ✅ **Communication**: Send updates and notifications\\n\\n### **Secondary Uses**\\n- 📊 **Analytics**: Improve website performance\\n- 🎯 **Marketing**: Send relevant promotional content\\n- 🔍 **Research**: Analyze user behavior patterns\\n\\n## 📤 Information Sharing\\n\\n### **We Share Information With:**\\n- **Service Providers**: Payment processors, hosting services\\n- **Legal Requirements**: When required by law or court order\\n- **Business Partners**: Trusted third-party integrations\\n- **Security**: To prevent fraud or illegal activities\\n\\n### **We Do NOT Share:**\\n- ❌ Personal information with unauthorized third parties\\n- ❌ Wallet private keys (we never have access to them)\\n- ❌ Sensitive financial data beyond what's necessary\\n\\n## 🛡️ Data Security\\n\\n### **Security Measures**\\n- 🔐 **Encryption**: All data transmitted using SSL/TLS\\n- 🏰 **Secure Storage**: Data stored in encrypted databases\\n- 🔑 **Access Control**: Limited access to authorized personnel\\n- 🛡️ **Regular Audits**: Security assessments and updates\\n\\n### **Data Breach Response**\\nIn case of a data breach, we will:\\n1. Notify affected users within 72 hours\\n2. Report to relevant authorities\\n3. Implement additional security measures\\n4. Provide credit monitoring if necessary\\n\\n## 📝 Form Consent\\n\\n### **Contact Forms**\\nBy submitting any form on our website, you agree to:\\n- ✅ Provide accurate and complete information\\n- ✅ Allow us to contact you regarding your inquiry\\n- ✅ Receive follow-up communications if necessary\\n\\n### **Newsletter Subscription**\\nSubscribing to our newsletter means you consent to:\\n- ✅ Receive regular updates about our project\\n- ✅ Receive promotional content and announcements\\n- ✅ Unsubscribe at any time using the provided link\\n\\n## 🌍 International Data Transfers\\n\\nYour information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during international transfers.\\n\\n## 👶 Children's Privacy\\n\\nOur services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.\\n\\n## 🔄 Your Rights\\n\\n### **You Have the Right To:**\\n- 📋 **Access**: Request copies of your personal data\\n- ✏️ **Rectification**: Correct inaccurate information\\n- 🗑️ **Erasure**: Request deletion of your data\\n- 📤 **Portability**: Receive your data in a portable format\\n- 🚫 **Objection**: Object to certain processing activities\\n\\n### **How to Exercise Your Rights**\\nContact us at: **privacy@coinpresale.com**\\n\\n## 📞 Contact Information\\n\\n### **Data Protection Officer**\\n- **Email**: dpo@coinpresale.com\\n- **Address**: [Your Business Address]\\n- **Phone**: [Your Phone Number]\\n\\n### **General Inquiries**\\n- **Email**: support@coinpresale.com\\n- **Website**: [Your Website]\\n- **Response Time**: Within 48 hours\\n\\n## 📅 Policy Updates\\n\\nWe may update this Privacy Policy from time to time. We will notify you of any changes by:\\n- 📧 Sending an email notification\\n- 🔔 Posting a notice on our website\\n- 📱 Updating the \\"Last updated\\" date\\n\\n## ⚖️ Legal Basis for Processing\\n\\nWe process your personal data based on:\\n- ✅ **Consent**: When you explicitly agree\\n- ✅ **Contract**: To fulfill our services\\n- ✅ **Legal Obligation**: To comply with laws\\n- ✅ **Legitimate Interest**: For business operations\\n\\n## 🏛️ Governing Law\\n\\nThis Privacy Policy is governed by the laws of [Your Jurisdiction] and any disputes will be resolved in the courts of [Your Jurisdiction].\\n\\n---\\n\\n**By using our website and services, you acknowledge that you have read and understood this Privacy Policy.**\\n\\n*For questions about this Privacy Policy, please contact us at privacy@coinpresale.com*"}	cmgtkbc7v0004oi0t2lr9krcj
cmf4p8l8t000ngp0h653nx6e5	2025-09-04 01:00:01.037	2025-10-19 18:48:04.183	Partners	partners	{"images": [{"id": "cmgxu0oir0003pg01mzotiry9", "alt": null, "url": "/uploads/ffad7a22-6183-4e2b-8282-4a8581dd7340.webp", "path": "/app/uploads/ffad7a22-6183-4e2b-8282-4a8581dd7340.webp", "size": 4852, "width": 320, "height": 70, "filename": "ffad7a22-6183-4e2b-8282-4a8581dd7340.webp", "mimeType": "image/webp", "createdAt": "2025-10-19T14:58:51.556Z", "updatedAt": "2025-10-19T14:58:51.556Z", "description": null, "originalName": "partner_1.webp"}, {"id": "cmgxu0pir0004pg01duztfhyk", "alt": null, "url": "/uploads/b0457891-141e-47c7-becf-b7d4fa694cfb.webp", "path": "/app/uploads/b0457891-141e-47c7-becf-b7d4fa694cfb.webp", "size": 6330, "width": 320, "height": 70, "filename": "b0457891-141e-47c7-becf-b7d4fa694cfb.webp", "mimeType": "image/webp", "createdAt": "2025-10-19T14:58:52.852Z", "updatedAt": "2025-10-19T14:58:52.852Z", "description": null, "originalName": "partner_2.webp"}, {"id": "cmgxu0r740005pg01ajss6ucu", "alt": null, "url": "/uploads/a1e69e73-73c5-4bb1-8afa-113cbbf6f02f.webp", "path": "/app/uploads/a1e69e73-73c5-4bb1-8afa-113cbbf6f02f.webp", "size": 7212, "width": 320, "height": 70, "filename": "a1e69e73-73c5-4bb1-8afa-113cbbf6f02f.webp", "mimeType": "image/webp", "createdAt": "2025-10-19T14:58:55.025Z", "updatedAt": "2025-10-19T14:58:55.025Z", "description": null, "originalName": "partner_3.webp"}, {"id": "cmgxu0slh0006pg019ey9v0x6", "alt": null, "url": "/uploads/8a07818c-a137-4ff6-a4fb-f1aa9e5c3517.webp", "path": "/app/uploads/8a07818c-a137-4ff6-a4fb-f1aa9e5c3517.webp", "size": 4216, "width": 320, "height": 70, "filename": "8a07818c-a137-4ff6-a4fb-f1aa9e5c3517.webp", "mimeType": "image/webp", "createdAt": "2025-10-19T14:58:56.838Z", "updatedAt": "2025-10-19T14:58:56.838Z", "description": null, "originalName": "partner_4.webp"}]}	cmf4p8l6d000kgp0hevn6yyuz
cmf1jmpp7000egpn0emif35tm	2025-09-01 19:59:43.772	2025-10-19 18:49:39.599	WhatIsCoin	whatiscoin	{"infos": [{"image": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "textField1": "Decentralized Finance", "textField2": "Experience the future of finance with tools like staking, lending, and borrowing — all powered by blockchain, without traditional banks"}, {"image": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "textField1": "Decentralized Finance", "textField2": "Experience the future of finance with tools like staking, lending, and borrowing — all powered by blockchain, without traditional banks"}, {"image": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "textField1": "Decentralized Finance", "textField2": "Experience the future of finance with tools like staking, lending, and borrowing — all powered by blockchain, without traditional banks"}, {"image": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "textField1": "Decentralized Finance", "textField2": "Experience the future of finance with tools like staking, lending, and borrowing — all powered by blockchain, without traditional banks"}, {"image": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "textField1": "Decentralized Finance", "textField2": "Experience the future of finance with tools like staking, lending, and borrowing — all powered by blockchain, without traditional banks"}], "title": "What is Coin?", "images": [{"id": "cmgw6uhkd0004qm01rq223eld", "alt": null, "url": "/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "path": "/app/uploads/8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "size": 1739, "width": null, "height": null, "filename": "8cb6ab2c-d4de-43b5-b214-d13584750908.svg", "mimeType": "image/svg+xml", "createdAt": "2025-10-18T11:22:25.261Z", "updatedAt": "2025-10-18T11:22:25.261Z", "description": null, "originalName": "Group (1).svg"}, {"id": "cmgy28c850003kn01t8n99atc", "alt": null, "url": "/uploads/0164cfb7-4653-48c2-ac8e-d063c96c9cd9.svg", "path": "/app/uploads/0164cfb7-4653-48c2-ac8e-d063c96c9cd9.svg", "size": 1739, "width": null, "height": null, "filename": "0164cfb7-4653-48c2-ac8e-d063c96c9cd9.svg", "mimeType": "image/svg+xml", "createdAt": "2025-10-19T18:48:45.797Z", "updatedAt": "2025-10-19T18:48:45.797Z", "description": null, "originalName": "Group (1).svg"}, {"id": "cmgy28paw0004kn01rx8aprht", "alt": null, "url": "/uploads/076466ee-d624-40a2-a6df-f22fd9c83792.svg", "path": "/app/uploads/076466ee-d624-40a2-a6df-f22fd9c83792.svg", "size": 1739, "width": null, "height": null, "filename": "076466ee-d624-40a2-a6df-f22fd9c83792.svg", "mimeType": "image/svg+xml", "createdAt": "2025-10-19T18:49:02.744Z", "updatedAt": "2025-10-19T18:49:02.744Z", "description": null, "originalName": "Group (1).svg"}, {"id": "cmgy28vmw0005kn01n35f0sqp", "alt": null, "url": "/uploads/ce8447b6-78c9-4806-82c1-b37548c2a1bf.svg", "path": "/app/uploads/ce8447b6-78c9-4806-82c1-b37548c2a1bf.svg", "size": 1739, "width": null, "height": null, "filename": "ce8447b6-78c9-4806-82c1-b37548c2a1bf.svg", "mimeType": "image/svg+xml", "createdAt": "2025-10-19T18:49:10.952Z", "updatedAt": "2025-10-19T18:49:10.952Z", "description": null, "originalName": "Group (1).svg"}], "subtitle": "Join the presale and become part of the future of decentralized finance. Get early access to an innovative DeFi platform with instant transactions."}	cmf1jmpn7000agpn0snhmqjhw
\.


--
-- TOC entry 3573 (class 0 OID 17221)
-- Dependencies: 223
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, created_at, updated_at, site_name, site_logo, site_description, presale_end_date_time, presale_active, usdt_to_coin_rate, sol_to_coin_rate) FROM stdin;
cmf5nuiab0000gpht5t22xmsi	2025-09-04 17:08:50.579	2025-10-22 19:49:54.08	CryptoHomayak	/uploads/5ac2b67c-9b0e-4c76-8ef0-4ad99cb716c0.svg	Revolutionary cryptocurrency platform	2025-11-07 05:18:00	t	1000	1000000
\.


--
-- TOC entry 3381 (class 2606 OID 17003)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3394 (class 2606 OID 17031)
-- Name: activation_links activation_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activation_links
    ADD CONSTRAINT activation_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3397 (class 2606 OID 17107)
-- Name: authorization_requests authorization_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorization_requests
    ADD CONSTRAINT authorization_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 3414 (class 2606 OID 17263)
-- Name: coin coin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coin
    ADD CONSTRAINT coin_pkey PRIMARY KEY (id);


--
-- TOC entry 3416 (class 2606 OID 17272)
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 3412 (class 2606 OID 17246)
-- Name: docs_config docs_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docs_config
    ADD CONSTRAINT docs_config_pkey PRIMARY KEY (id);


--
-- TOC entry 3418 (class 2606 OID 17284)
-- Name: documentation documentation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentation
    ADD CONSTRAINT documentation_pkey PRIMARY KEY (id);


--
-- TOC entry 3403 (class 2606 OID 17138)
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- TOC entry 3408 (class 2606 OID 17176)
-- Name: section_fields section_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.section_fields
    ADD CONSTRAINT section_fields_pkey PRIMARY KEY (id);


--
-- TOC entry 3406 (class 2606 OID 17164)
-- Name: section_types section_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.section_types
    ADD CONSTRAINT section_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3401 (class 2606 OID 17130)
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- TOC entry 3389 (class 2606 OID 17022)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3410 (class 2606 OID 17232)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3384 (class 2606 OID 17013)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3391 (class 1259 OID 17109)
-- Name: activation_links_authorization_request_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX activation_links_authorization_request_id_key ON public.activation_links USING btree (authorization_request_id);


--
-- TOC entry 3392 (class 1259 OID 17098)
-- Name: activation_links_link_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX activation_links_link_key ON public.activation_links USING btree (link);


--
-- TOC entry 3395 (class 1259 OID 17108)
-- Name: authorization_requests_activation_link_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX authorization_requests_activation_link_id_key ON public.authorization_requests USING btree (activation_link_id);


--
-- TOC entry 3419 (class 1259 OID 17285)
-- Name: documentation_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX documentation_slug_key ON public.documentation USING btree (slug);


--
-- TOC entry 3404 (class 1259 OID 17177)
-- Name: section_types_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX section_types_name_key ON public.section_types USING btree (name);


--
-- TOC entry 3398 (class 1259 OID 17140)
-- Name: sections_link_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sections_link_key ON public.sections USING btree (link);


--
-- TOC entry 3399 (class 1259 OID 17139)
-- Name: sections_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sections_name_key ON public.sections USING btree (name);


--
-- TOC entry 3386 (class 1259 OID 17035)
-- Name: sessions_activation_link_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sessions_activation_link_id_key ON public.sessions USING btree (activation_link_id);


--
-- TOC entry 3387 (class 1259 OID 17110)
-- Name: sessions_authorization_request_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sessions_authorization_request_id_key ON public.sessions USING btree (authorization_request_id);


--
-- TOC entry 3390 (class 1259 OID 17034)
-- Name: sessions_refresh_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sessions_refresh_token_key ON public.sessions USING btree (refresh_token);


--
-- TOC entry 3382 (class 1259 OID 17032)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 3385 (class 1259 OID 17033)
-- Name: users_wallet_address_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_wallet_address_key ON public.users USING btree (wallet_address);


--
-- TOC entry 3423 (class 2606 OID 17116)
-- Name: activation_links activation_links_authorization_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activation_links
    ADD CONSTRAINT activation_links_authorization_request_id_fkey FOREIGN KEY (authorization_request_id) REFERENCES public.authorization_requests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3426 (class 2606 OID 17286)
-- Name: documentation documentation_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentation
    ADD CONSTRAINT documentation_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.documentation(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3425 (class 2606 OID 17183)
-- Name: section_fields section_fields_section_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.section_fields
    ADD CONSTRAINT section_fields_section_type_id_fkey FOREIGN KEY (section_type_id) REFERENCES public.section_types(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3424 (class 2606 OID 17178)
-- Name: sections sections_section_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_section_type_id_fkey FOREIGN KEY (section_type_id) REFERENCES public.section_types(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3420 (class 2606 OID 17052)
-- Name: sessions sessions_activation_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_activation_link_id_fkey FOREIGN KEY (activation_link_id) REFERENCES public.activation_links(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3421 (class 2606 OID 17111)
-- Name: sessions sessions_authorization_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_authorization_request_id_fkey FOREIGN KEY (authorization_request_id) REFERENCES public.authorization_requests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3422 (class 2606 OID 17037)
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-10-23 19:51:57 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict tu5umfqNZfP0nPdyslgmhBJmSR3vQE8bnbtEbtzkm22InV58BElB7AAT6s6uG9N

