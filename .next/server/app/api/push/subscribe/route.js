"use strict";(()=>{var e={};e.id=611,e.ids=[611],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8893:e=>{e.exports=require("buffer")},4770:e=>{e.exports=require("crypto")},6162:e=>{e.exports=require("stream")},1764:e=>{e.exports=require("util")},8678:e=>{e.exports=import("pg")},3053:(e,E,t)=>{t.a(e,async(e,A)=>{try{t.r(E),t.d(E,{originalPathname:()=>L,patchFetch:()=>a,requestAsyncStorage:()=>n,routeModule:()=>o,serverHooks:()=>N,staticGenerationAsyncStorage:()=>u});var r=t(3278),s=t(5002),T=t(4877),R=t(9135),i=e([R]);R=(i.then?(await i)():i)[0];let o=new r.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/push/subscribe/route",pathname:"/api/push/subscribe",filename:"route",bundlePath:"app/api/push/subscribe/route"},resolvedPagePath:"P:\\boursedutemps\\app\\api\\push\\subscribe\\route.ts",nextConfigOutput:"",userland:R}),{requestAsyncStorage:n,staticGenerationAsyncStorage:u,serverHooks:N}=o,L="/api/push/subscribe/route";function a(){return(0,T.patchFetch)({serverHooks:N,staticGenerationAsyncStorage:u})}A()}catch(e){A(e)}})},9135:(e,E,t)=>{t.a(e,async(e,A)=>{try{t.r(E),t.d(E,{POST:()=>i});var r=t(1309),s=t(6910),T=t(871),R=e([T]);async function i(e){let E=(0,s.bE)(e);if(!E)return r.NextResponse.json({error:"Unauthorized"},{status:401});let t=await e.json();try{return(await (0,T.IO)("SELECT id FROM push_subscriptions WHERE user_id = $1",[E])).rowCount>0?await (0,T.IO)("UPDATE push_subscriptions SET subscription = $1 WHERE user_id = $2",[JSON.stringify(t),E]):await (0,T.IO)("INSERT INTO push_subscriptions (user_id, subscription) VALUES ($1, $2)",[E,JSON.stringify(t)]),r.NextResponse.json({success:!0})}catch(e){return console.error("Error saving subscription:",e),r.NextResponse.json({error:"Internal Server Error"},{status:500})}}T=(R.then?(await R)():R)[0],A()}catch(e){A(e)}})},871:(e,E,t)=>{t.a(e,async(e,A)=>{try{t.d(E,{IO:()=>o});var r=t(8678),s=e([r]);r=(s.then?(await s)():s)[0];let T="postgres://mock:mock@localhost:5432/mock",R=!0;if(process.env.DATABASE_URL)try{new URL(process.env.DATABASE_URL),T=process.env.DATABASE_URL,R=!1,console.log("[DB] DATABASE_URL is set and valid.")}catch(e){console.error("[DB] Invalid DATABASE_URL format. Falling back to mock URL for build/safety.")}else console.warn("========================================================="),console.warn("WARNING: DATABASE_URL environment variable is missing."),console.warn("Using a mock URL for build purposes."),console.warn("=========================================================");let i=new r.default.Pool({connectionString:T,ssl:!T.includes("localhost")&&{rejectUnauthorized:!1},connectionTimeoutMillis:5e3}),a=!1,o=async(e,E)=>{if(R)return console.warn(`[DB] Mock mode active. Returning empty result for query: ${e.substring(0,50)}...`),{rows:[],rowCount:0};if(!i)throw Error("Database pool not initialized");return a||-1!==e.toLowerCase().indexOf("create table")||-1!==e.toLowerCase().indexOf("alter table")||(await n(),a=!0),await i.query(e,E)},n=async()=>{if(i&&!R)try{let e=await i.connect();try{await e.query(`
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
    `),console.log("[DB] Tables initialized successfully")}finally{e.release()}}catch(e){console.error("[DB] Initialization error:",e)}};A()}catch(e){A(e)}})},6910:(e,E,t)=>{t.d(E,{bE:()=>R,fT:()=>T});var A=t(7390),r=t.n(A);let s=process.env.JWT_SECRET||"your-secret-key";function T(e){return r().sign(e,s,{expiresIn:"7d"})}function R(e){let E=e.headers.get("Authorization");if(!E||!E.startsWith("Bearer "))return null;let t=function(e){try{return r().verify(e,s)}catch(e){return null}}(E.split(" ")[1]);return t?.uid||null}}};var E=require("../../../../webpack-runtime.js");E.C(e);var t=e=>E(E.s=e),A=E.X(0,[379,833,986,390],()=>t(3053));module.exports=A})();