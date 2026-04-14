"use strict";(()=>{var e={};e.id=315,e.ids=[315],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8678:e=>{e.exports=import("pg")},3817:(e,E,A)=>{A.a(e,async(e,T)=>{try{A.r(E),A.d(E,{originalPathname:()=>u,patchFetch:()=>a,requestAsyncStorage:()=>N,routeModule:()=>o,serverHooks:()=>L,staticGenerationAsyncStorage:()=>n});var t=A(3278),R=A(5002),r=A(4877),s=A(9405),i=e([s]);s=(i.then?(await i)():i)[0];let o=new t.AppRouteRouteModule({definition:{kind:R.x.APP_ROUTE,page:"/api/verify/check/route",pathname:"/api/verify/check",filename:"route",bundlePath:"app/api/verify/check/route"},resolvedPagePath:"P:\\boursedutemps\\app\\api\\verify\\check\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:N,staticGenerationAsyncStorage:n,serverHooks:L}=o,u="/api/verify/check/route";function a(){return(0,r.patchFetch)({serverHooks:L,staticGenerationAsyncStorage:n})}T()}catch(e){T(e)}})},9405:(e,E,A)=>{A.a(e,async(e,T)=>{try{A.r(E),A.d(E,{POST:()=>s});var t=A(1309),R=A(871),r=e([R]);async function s(e){let{email:E,phone:A,emailCode:T,phoneCode:r}=await e.json();try{let e=await (0,R.IO)("SELECT * FROM otps WHERE identifier = $1 AND code = $2 AND expires_at > NOW()",[E,T]),s=await (0,R.IO)("SELECT * FROM otps WHERE identifier = $1 AND code = $2 AND expires_at > NOW()",[A,r]);if(e.rowCount>0&&s.rowCount>0)return t.NextResponse.json({success:!0});return t.NextResponse.json({error:"Codes invalides ou expir\xe9s"},{status:400})}catch(e){return console.error("Error checking verification:",e),t.NextResponse.json({error:"Internal Server Error"},{status:500})}}R=(r.then?(await r)():r)[0],T()}catch(e){T(e)}})},871:(e,E,A)=>{A.a(e,async(e,T)=>{try{A.d(E,{IO:()=>o});var t=A(8678),R=e([t]);t=(R.then?(await R)():R)[0];let r="postgres://mock:mock@localhost:5432/mock",s=!0;if(process.env.DATABASE_URL)try{new URL(process.env.DATABASE_URL),r=process.env.DATABASE_URL,s=!1,console.log("[DB] DATABASE_URL is set and valid.")}catch(e){console.error("[DB] Invalid DATABASE_URL format. Falling back to mock URL for build/safety.")}else console.warn("========================================================="),console.warn("WARNING: DATABASE_URL environment variable is missing."),console.warn("Using a mock URL for build purposes."),console.warn("=========================================================");let i=new t.default.Pool({connectionString:r,ssl:!r.includes("localhost")&&{rejectUnauthorized:!1},connectionTimeoutMillis:5e3}),a=!1,o=async(e,E)=>{if(s)return console.warn(`[DB] Mock mode active. Returning empty result for query: ${e.substring(0,50)}...`),{rows:[],rowCount:0};if(!i)throw Error("Database pool not initialized");return a||-1!==e.toLowerCase().indexOf("create table")||-1!==e.toLowerCase().indexOf("alter table")||(await N(),a=!0),await i.query(e,E)},N=async()=>{if(i&&!s)try{let e=await i.connect();try{await e.query(`
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
    `),console.log("[DB] Tables initialized successfully")}finally{e.release()}}catch(e){console.error("[DB] Initialization error:",e)}};T()}catch(e){T(e)}})}};var E=require("../../../../webpack-runtime.js");E.C(e);var A=e=>E(E.s=e),T=E.X(0,[379,833],()=>A(3817));module.exports=T})();