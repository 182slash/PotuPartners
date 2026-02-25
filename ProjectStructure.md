PS X:\Project\PotuPartners> tree /F
Folder PATH listing for volume 182
Volume serial number is 0000027B 30B6:2486
X:.
│   .gitignore
│   docker-compose.yml
│   ecosystem.config.js
│   ProjectStructure.md
│   README.md
│   SECURITY_CHECKLIST.md
│   
├───.github
│   │   SECRETS_REFERENCE.md
│   │
│   └───workflows
│           deploy-backend.yml
│           deploy-frontend.yml
│
├───.vscode
│       tasks.json
│
├───backend
│   │   .env.example
│   │   Dockerfile
│   │   package.json
│   │   tsconfig.json
│   │
│   ├───migrations
│   │       001_create_users.sql
│   │       002_create_refresh_tokens.sql
│   │       003_create_conversations.sql
│   │       004_create_messages.sql
│   │       005_create_files_and_rag.sql
│   │
│   └───src
│       │   index.ts
│       │
│       ├───config
│       │       database.ts
│       │       env.ts
│       │       storage.ts
│       │
│       ├───db
│       │       migrate.ts
│       │
│       ├───middleware
│       │       auth.middleware.ts
│       │       upload.middleware.ts
│       │
│       ├───modules
│       │   ├───admin
│       │   │       admin.routes.ts
│       │   │       admin.service.ts
│       │   │       ai.routes.ts
│       │   │       ai.service.ts
│       │   │
│       │   ├───auth
│       │   │       auth.controller.ts
│       │   │       auth.routes.ts
│       │   │       auth.service.ts
│       │   │
│       │   ├───conversations
│       │   │       conversations.routes.ts
│       │   │       conversations.service.ts
│       │   │
│       │   ├───files
│       │   │       files.routes.ts
│       │   │       files.service.ts
│       │   │
│       │   ├───messages
│       │   │       messages.routes.ts
│       │   │       messages.service.ts
│       │   │
│       │   └───users
│       │           users.routes.ts
│       │           users.service.ts
│       │
│       ├───scripts
│       │       seed.ts
│       │
│       ├───socket
│       │       chatHandler.ts
│       │
│       ├───types
│       │       index.ts
│       │
│       ├───utils
│       │       auth.ts
│       │       errors.ts
│       │       logger.ts
│       │       validators.ts
│       │
│       └───{config,modules
│           ├───{auth,users,conversations,messages,files,admin,ai},socket,utils,middleware}
│           └───{auth,users,conversations,messages,files,admin},socket,utils,middleware}
├───frontend
│   │   .env.local
│   │   next.config.js
│   │   package.json
│   │   postcss.config.js
│   │   README.md
│   │   tailwind.config.js
│   │   tsconfig.json
│   │
│   ├───public
│   │   │   manifest.json
│   │   │
│   │   ├───.well-known
│   │   │       assetlinks.json
│   │   │
│   │   └───{icons,.well-known}
│   └───src
│       ├───app
│       │   │   globals.css
│       │   │   layout.tsx
│       │   │   page.tsx
│       │   │
│       │   └───admin
│       │           layout.tsx
│       │           page.tsx
│       │
│       ├───components
│       │   ├───chat
│       │   │       AuthGate.tsx
│       │   │       ChatButton.tsx
│       │   │       ChatPanel.tsx
│       │   │       ChatSidebar.tsx
│       │   │       ChatWindow.tsx
│       │   │       ContactSelector.tsx
│       │   │       FileUpload.tsx
│       │   │       MessageBubble.tsx
│       │   │       TypingIndicator.tsx
│       │   │
│       │   ├───layout
│       │   │       Footer.tsx
│       │   │       Navbar.tsx
│       │   │
│       │   └───sections
│       │           AboutOffice.tsx
│       │           CaseHighlights.tsx
│       │           Hero.tsx
│       │           Mission.tsx
│       │           Partners.tsx
│       │           Services.tsx
│       │           Vision.tsx
│       │
│       ├───hooks
│       │       useAuth.ts
│       │       useChat.ts
│       │       useFileUpload.ts
│       │       useReveal.ts
│       │       useSocket.ts
│       │
│       ├───lib
│       │       socket.ts
│       │       utils.ts
│       │
│       ├───services
│       │       api.ts
│       │
│       ├───store
│       │       authStore.ts
│       │       chatStore.ts
│       │
│       ├───types
│       │       index.ts
│       │
│       └───{app
│           └───{chat,admin},components
│               └───{layout,sections,chat,ui},hooks,lib,store,types,services}
├───nginx
│       potupartners.conf
│
├───pwa
│       assetlinks.json
│       twa-manifest.json
│
├───rag-service
│   │   .env.example
│   │   Dockerfile
│   │   requirements.txt
│   │
│   └───app
│       │   config.py
│       │   main.py
│       │
│       ├───models
│       │       schemas.py
│       │
│       ├───routes
│       │       ingest.py
│       │       query.py
│       │
│       ├───services
│       │       chunker.py
│       │       document_processor.py
│       │       embedder.py
│       │       llm.py
│       │       vector_store.py
│       │
│       └───{routes,services,models}
└───scripts
        setup.sh