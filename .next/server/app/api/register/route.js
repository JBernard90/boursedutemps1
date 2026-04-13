"use strict";(()=>{var e={};e.id=569,e.ids=[569],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8893:e=>{e.exports=require("buffer")},4770:e=>{e.exports=require("crypto")},6162:e=>{e.exports=require("stream")},1764:e=>{e.exports=require("util")},8678:e=>{e.exports=import("pg")},5846:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.r(t),r.d(t,{originalPathname:()=>N,patchFetch:()=>R,requestAsyncStorage:()=>o,routeModule:()=>n,serverHooks:()=>l,staticGenerationAsyncStorage:()=>u});var s=r(3278),A=r(5002),a=r(4877),T=r(7007),i=e([T]);T=(i.then?(await i)():i)[0];let n=new s.AppRouteRouteModule({definition:{kind:A.x.APP_ROUTE,page:"/api/register/route",pathname:"/api/register",filename:"route",bundlePath:"app/api/register/route"},resolvedPagePath:"P:\\boursedutemps\\app\\api\\register\\route.ts",nextConfigOutput:"",userland:T}),{requestAsyncStorage:o,staticGenerationAsyncStorage:u,serverHooks:l}=n,N="/api/register/route";function R(){return(0,a.patchFetch)({serverHooks:l,staticGenerationAsyncStorage:u})}E()}catch(e){E(e)}})},7007:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.r(t),r.d(t,{POST:()=>n});var s=r(1309),A=r(871),a=r(6910),T=r(7619),i=r(1063),R=e([A]);async function n(e){let t=await e.json();if(!t.email||!t.password||!t.firstName||!t.lastName)return s.NextResponse.json({error:"Champs requis manquants"},{status:400});if((await (0,A.IO)("SELECT * FROM users WHERE email = $1",[t.email])).rowCount>0)return s.NextResponse.json({error:"Cet email est d\xe9j\xe0 utilis\xe9"},{status:400});let r=await T.ZP.hash(t.password,10),E=(0,i.Z)(),R="jeanbernardpierrelouis@gmail.com"===t.email?"admin":"user";try{await (0,A.IO)(`INSERT INTO users (
        uid, email, password, first_name, last_name, whatsapp, department, gender, country, 
        availability, languages, offered_skills, requested_skills, avatar, terms_accepted, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,[E,t.email,r,t.firstName,t.lastName,t.phone,t.department,t.gender,t.country,t.availability,JSON.stringify(t.languages),JSON.stringify(t.offeredSkills),JSON.stringify(t.requestedSkills),t.avatar,!0,R]);let e=(0,a.fT)({uid:E,email:t.email});return s.NextResponse.json({token:e,uid:E})}catch(e){return console.error("Registration error:",e),s.NextResponse.json({error:"Erreur lors de l'inscription"},{status:500})}}A=(R.then?(await R)():R)[0],E()}catch(e){E(e)}})},871:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.d(t,{IO:()=>n});var s=r(8678),A=e([s]);s=(A.then?(await A)():A)[0];let a="postgres://mock:mock@localhost:5432/mock",T=!0;if(process.env.DATABASE_URL)try{new URL(process.env.DATABASE_URL),a=process.env.DATABASE_URL,T=!1,console.log("[DB] DATABASE_URL is set and valid.")}catch(e){console.error("[DB] Invalid DATABASE_URL format. Falling back to mock URL for build/safety.")}else console.warn("========================================================="),console.warn("WARNING: DATABASE_URL environment variable is missing."),console.warn("Using a mock URL for build purposes."),console.warn("=========================================================");let i=new s.default.Pool({connectionString:a,ssl:!a.includes("localhost")&&{rejectUnauthorized:!1},connectionTimeoutMillis:5e3}),R=!1,n=async(e,t)=>{if(T)return console.warn(`[DB] Mock mode active. Returning empty result for query: ${e.substring(0,50)}...`),{rows:[],rowCount:0};if(!i)throw Error("Database pool not initialized");return R||-1!==e.toLowerCase().indexOf("create table")||-1!==e.toLowerCase().indexOf("alter table")||(await o(),R=!0),await i.query(e,t)},o=async()=>{if(i&&!T)try{let e=await i.connect();try{await e.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(255),
        campus VARCHAR(255),
        department VARCHAR(255),
        gender VARCHAR(50),
        country VARCHAR(255),
        availability VARCHAR(255),
        languages JSONB,
        offered_skills JSONB,
        requested_skills JSONB,
        bio TEXT,
        skills TEXT[],
        needs TEXT[],
        avatar VARCHAR(255),
        cover_photo VARCHAR(255),
        credits INTEGER DEFAULT 5,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'active',
        verified BOOLEAN DEFAULT true,
        is_verified_email BOOLEAN DEFAULT true,
        is_verified_sms BOOLEAN DEFAULT true,
        terms_accepted BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      DO $$ 
      BEGIN 
        BEGIN
          ALTER TABLE users ADD COLUMN gender VARCHAR(50);
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
        BEGIN
          ALTER TABLE users ADD COLUMN country VARCHAR(255);
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
        BEGIN
          ALTER TABLE users ADD COLUMN availability VARCHAR(255);
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
        BEGIN
          ALTER TABLE users ADD COLUMN languages JSONB;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
        BEGIN
          ALTER TABLE users ADD COLUMN offered_skills JSONB;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
        BEGIN
          ALTER TABLE users ADD COLUMN requested_skills JSONB;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
        BEGIN
          ALTER TABLE users ADD COLUMN terms_accepted BOOLEAN DEFAULT true;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
      END $$;

      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(uid),
        user_name VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        credit_cost INTEGER NOT NULL,
        category VARCHAR(255),
        status VARCHAR(50) DEFAULT 'proposed',
        accepted_by VARCHAR(255) REFERENCES users(uid),
        accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(uid),
        user_name VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        credit_offer INTEGER NOT NULL,
        category VARCHAR(255),
        status VARCHAR(50) DEFAULT 'proposed',
        fulfilled_by VARCHAR(255) REFERENCES users(uid),
        fulfilled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        author_id VARCHAR(255) REFERENCES users(uid),
        author_name VARCHAR(255),
        author_avatar VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(255),
        media JSONB DEFAULT '[]',
        likes TEXT[] DEFAULT '{}',
        dislikes TEXT[] DEFAULT '{}',
        shares INTEGER DEFAULT 0,
        reposts INTEGER DEFAULT 0,
        comments JSONB DEFAULT '[]',
        external_link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        author_id VARCHAR(255) REFERENCES users(uid),
        author_name VARCHAR(255),
        author_avatar VARCHAR(255),
        title VARCHAR(255),
        content TEXT NOT NULL,
        rating INTEGER NOT NULL,
        media JSONB DEFAULT '[]',
        likes TEXT[] DEFAULT '{}',
        dislikes TEXT[] DEFAULT '{}',
        shares INTEGER DEFAULT 0,
        reposts INTEGER DEFAULT 0,
        comments JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS forum_topics (
        id SERIAL PRIMARY KEY,
        author_id VARCHAR(255) REFERENCES users(uid),
        author_name VARCHAR(255),
        author_avatar VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(255),
        media JSONB DEFAULT '[]',
        likes TEXT[] DEFAULT '{}',
        dislikes TEXT[] DEFAULT '{}',
        shares INTEGER DEFAULT 0,
        reposts INTEGER DEFAULT 0,
        comments JSONB DEFAULT '[]',
        external_link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS connections (
        id SERIAL PRIMARY KEY,
        sender_id VARCHAR(255) REFERENCES users(uid),
        receiver_id VARCHAR(255) REFERENCES users(uid),
        status VARCHAR(50) DEFAULT 'sent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        from_id VARCHAR(255) REFERENCES users(uid),
        to_id VARCHAR(255) REFERENCES users(uid),
        amount INTEGER NOT NULL,
        service_title VARCHAR(255),
        type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(uid),
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        from_name VARCHAR(255),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id VARCHAR(255) REFERENCES users(uid),
        receiver_id VARCHAR(255) REFERENCES users(uid),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(uid),
        subscription JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      DO $ 
      BEGIN 
        BEGIN
          ALTER TABLE connections DROP COLUMN id;
          ALTER TABLE connections ADD COLUMN id SERIAL PRIMARY KEY;
        EXCEPTION
          WHEN others THEN null;
        END;
      END $$;
    `),console.log("[DB] Tables initialized successfully")}finally{e.release()}}catch(e){console.error("[DB] Initialization error:",e)}};E()}catch(e){E(e)}})},6910:(e,t,r)=>{r.d(t,{bE:()=>T,fT:()=>a});var E=r(7390),s=r.n(E);let A=process.env.JWT_SECRET||"your-secret-key";function a(e){return s().sign(e,A,{expiresIn:"7d"})}function T(e){let t=e.headers.get("Authorization");if(!t||!t.startsWith("Bearer "))return null;let r=function(e){try{return s().verify(e,A)}catch(e){return null}}(t.split(" ")[1]);return r?.uid||null}},1063:(e,t,r)=>{r.d(t,{Z:()=>i});let E=require("node:crypto"),s={randomUUID:E.randomUUID},A=new Uint8Array(256),a=A.length,T=[];for(let e=0;e<256;++e)T.push((e+256).toString(16).slice(1));let i=function(e,t,r){return!s.randomUUID||t||e?function(e,t,r){let s=(e=e||{}).random??e.rng?.()??(a>A.length-16&&((0,E.randomFillSync)(A),a=0),A.slice(a,a+=16));if(s.length<16)throw Error("Random bytes length must be >= 16");if(s[6]=15&s[6]|64,s[8]=63&s[8]|128,t){if((r=r||0)<0||r+16>t.length)throw RangeError(`UUID byte range ${r}:${r+15} is out of buffer bounds`);for(let e=0;e<16;++e)t[r+e]=s[e];return t}return function(e,t=0){return(T[e[t+0]]+T[e[t+1]]+T[e[t+2]]+T[e[t+3]]+"-"+T[e[t+4]]+T[e[t+5]]+"-"+T[e[t+6]]+T[e[t+7]]+"-"+T[e[t+8]]+T[e[t+9]]+"-"+T[e[t+10]]+T[e[t+11]]+T[e[t+12]]+T[e[t+13]]+T[e[t+14]]+T[e[t+15]]).toLowerCase()}(s)}(e,t,r):s.randomUUID()}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),E=t.X(0,[379,833,390,981],()=>r(5846));module.exports=E})();