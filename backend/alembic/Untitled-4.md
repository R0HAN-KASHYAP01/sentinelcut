# File Tree: sentinelcut

**Generated:** 8/7/2026, 12:14:38 PM
**Root Path:** `d:\sentinelcut\sentinelcut`

```
├── 📁 .github
│   ├── 📁 ISSUE_TEMPLATE
│   │   ├── 📝 bug_report.md
│   │   └── 📝 feature_request.md
│   ├── 📁 workflows
│   │   ├── ⚙️ ai-pipeline-ci.yml
│   │   ├── ⚙️ backend-ci.yml
│   │   ├── ⚙️ deploy.yml
│   │   └── ⚙️ frontend-ci.yml
│   └── 📝 PULL_REQUEST_TEMPLATE.md
├── 📁 ai-pipeline
│   ├── 📁 notebooks
│   │   ├── 📄 asr_benchmark.ipynb
│   │   └── 📄 profanity_detection_eval.ipynb
│   ├── 📁 sentinelcut_ai
│   │   ├── 📁 asr
│   │   │   ├── 🐍 __init__.py
│   │   │   ├── 🐍 faster_whisper_engine.py
│   │   │   ├── 🐍 forced_alignment.py
│   │   │   └── 🐍 speech_recognition_service.py
│   │   ├── 📁 audio_processing
│   │   │   ├── 🐍 __init__.py
│   │   │   ├── 🐍 audio_editor.py
│   │   │   ├── 🐍 audio_extractor.py
│   │   │   └── 🐍 media_muxer.py
│   │   ├── 📁 data
│   │   │   ├── 📁 dictionaries
│   │   │   │   ├── ⚙️ english_profanity.json
│   │   │   │   ├── ⚙️ hindi_profanity.json
│   │   │   │   └── ⚙️ hinglish_slang.json
│   │   │   └── 📁 embeddings
│   │   │       └── ⚙️ seed_profanity_examples.json
│   │   ├── 📁 language_detection
│   │   │   ├── 🐍 __init__.py
│   │   │   └── 🐍 language_detector.py
│   │   ├── 📁 pipeline
│   │   │   ├── 🐍 __init__.py
│   │   │   ├── 🐍 pipeline_config.py
│   │   │   └── 🐍 processing_pipeline.py
│   │   ├── 📁 profanity_detection
│   │   │   ├── 🐍 __init__.py
│   │   │   ├── 🐍 confidence_aggregator.py
│   │   │   ├── 🐍 context_scorer.py
│   │   │   ├── 🐍 dictionary_matcher.py
│   │   │   ├── 🐍 normalizer.py
│   │   │   └── 🐍 profanity_detection_service.py
│   │   ├── 📁 utils
│   │   │   ├── 🐍 file_utils.py
│   │   │   ├── 🐍 logging_utils.py
│   │   │   └── 🐍 timing_utils.py
│   │   └── 🐍 __init__.py
│   ├── 📁 tests
│   │   ├── 🐍 test_context_scorer.py
│   │   ├── 🐍 test_dictionary_matcher.py
│   │   ├── 🐍 test_normalizer.py
│   │   └── 🐍 test_pipeline_integration.py
│   ├── 🐳 Dockerfile
│   ├── 📝 README.md
│   └── 📄 requirements.txt
├── 📁 backend
│   ├── 📁 alembic
│   │   ├── 📁 versions
│   │   │   └── 🐍 a7768827fca4_create_files_jobs_detections_custom_.py
│   │   ├── 🐍 env.py
│   │   └── 📄 script.py.mako
│   ├── 📁 app
│   │   ├── 📁 api
│   │   │   ├── 📁 deps
│   │   │   │   ├── 🐍 __init__.py
│   │   │   │   └── 🐍 auth_deps.py
│   │   │   ├── 📁 v1
│   │   │   │   ├── 📁 routes
│   │   │   │   │   ├── 🐍 __init__.py
│   │   │   │   │   ├── 🐍 auth_routes.py
│   │   │   │   │   ├── 🐍 dashboard_routes.py
│   │   │   │   │   ├── 🐍 detection_routes.py
│   │   │   │   │   ├── 🐍 export_routes.py
│   │   │   │   │   ├── 🐍 file_routes.py
│   │   │   │   │   ├── 🐍 timeline_routes.py
│   │   │   │   │   └── 🐍 websocket_routes.py
│   │   │   │   ├── 🐍 __init__.py
│   │   │   │   └── 🐍 router.py
│   │   │   └── 🐍 __init__.py
│   │   ├── 📁 core
│   │   │   ├── 🐍 __init__.py
│   │   │   ├── 🐍 constants.py
│   │   │   ├── 🐍 exceptions.py
│   │   │   ├── 🐍 logging_config.py
│   │   │   └── 🐍 security.py
│   │   ├── 📁 db
│   │   │   ├── 🐍 base.py
│   │   │   ├── 🐍 base_class.py
│   │   │   └── 🐍 session.py
│   │   ├── 📁 models
│   │   │   ├── 🐍 custom_word.py
│   │   │   ├── 🐍 detection.py
│   │   │   ├── 🐍 detection_config.py
│   │   │   ├── 🐍 export.py
│   │   │   ├── 🐍 file.py
│   │   │   ├── 🐍 job.py
│   │   │   ├── 🐍 job_log.py
│   │   │   ├── 🐍 profanity_dictionary.py
│   │   │   └── 🐍 profile.py
│   │   ├── 📁 repositories
│   │   │   ├── 🐍 base_repository.py
│   │   │   ├── 🐍 detection_repository.py
│   │   │   ├── 🐍 dictionary_repository.py
│   │   │   ├── 🐍 file_repository.py
│   │   │   ├── 🐍 job_repository.py
│   │   │   └── 🐍 user_repository.py
│   │   ├── 📁 schemas
│   │   │   ├── 🐍 __init__.py
│   │   │   ├── 🐍 auth_schema.py
│   │   │   ├── 🐍 detection_schema.py
│   │   │   ├── 🐍 file_schema.py
│   │   │   └── 🐍 job_schema.py
│   │   ├── 📁 services
│   │   │   ├── 🐍 auth_service.py
│   │   │   ├── 🐍 detection_config_service.py
│   │   │   ├── 🐍 export_service.py
│   │   │   ├── 🐍 file_service.py
│   │   │   ├── 🐍 job_orchestrator_service.py
│   │   │   └── 🐍 timeline_edit_service.py
│   │   ├── 📁 workers
│   │   │   ├── 📁 tasks
│   │   │   │   ├── 🐍 processing_task.py
│   │   │   │   └── 🐍 regeneration_task.py
│   │   │   ├── 🐍 celery_app.py
│   │   │   └── 🐍 status_publisher.py
│   │   ├── 🐍 config.py
│   │   ├── 🐍 dependencies.py
│   │   └── 🐍 main.py
│   ├── 📁 tests
│   │   ├── 📁 integration
│   │   │   ├── 📁 test_api_routes
│   │   │   └── 📁 test_db
│   │   ├── 📁 unit
│   │   │   ├── 📁 test_repositories
│   │   │   └── 📁 test_services
│   │   └── 🐍 conftest.py
│   ├── ⚙️ .flake8
│   ├── 🐳 Dockerfile
│   ├── 📝 README.md
│   ├── ⚙️ alembic.ini
│   ├── ⚙️ pytest.ini
│   ├── 📄 requirements-dev.txt
│   └── 📄 requirements.txt
├── 📁 database
│   ├── 📁 migrations
│   ├── 📁 schema
│   │   ├── 📝 er_diagram.md
│   │   └── 📄 schema_reference.sql
│   ├── 📁 seeds
│   │   ├── 🐍 seed_dev_users.py
│   │   └── 🐍 seed_profanity_dictionary.py
│   └── 📝 README.md
├── 📁 docs
│   ├── 📁 13_Testing
│   │   ├── 📝 QA_Checklist.md
│   │   ├── 📝 Test_Cases.md
│   │   └── 📝 Test_Plan.md
│   ├── 📁 academic
│   │   ├── 📁 Weekly_Progress_Reports
│   │   ├── 📝 College_Report.md
│   │   ├── 📝 Demo_Script.md
│   │   ├── 📝 Final_Viva_Questions.md
│   │   ├── 📝 IEEE_Research_Paper.md
│   │   ├── 📝 Poster_Content.md
│   │   ├── 📝 Presentation_Outline.md
│   │   ├── 📝 Project_Proposal.md
│   │   └── 📝 Project_Synopsis.md
│   ├── 📁 legal
│   │   ├── 📝 Privacy_Policy.md
│   │   └── 📝 Terms_and_Conditions.md
│   ├── 📁 manuals
│   │   ├── 📝 Admin_Manual.md
│   │   ├── 📝 Maintenance_Guide.md
│   │   └── 📝 User_Manual.md
│   ├── 📁 misc
│   │   ├── 📝 GitHub_Description.md
│   │   ├── 📝 LinkedIn_Description.md
│   │   ├── 📝 Release_Notes.md
│   │   ├── 📝 Resume_Description.md
│   │   └── 📝 Roadmap.md
│   ├── 📁 standards
│   │   ├── 📝 Coding_Standards.md
│   │   ├── 📝 Git_Workflow.md
│   │   ├── 📝 Security_Guidelines.md
│   │   └── 📝 Versioning_Strategy.md
│   ├── 📝 01_Product_Vision.md
│   ├── 📕 01_Product_Vision.md.pdf
│   ├── 📝 02_PRD.md
│   ├── 📕 02_PRD.md.pdf
│   ├── 📝 03_SRS.md
│   ├── 📕 03_SRS.md.pdf
│   ├── 📝 04_Tech_Stack_Justification.md
│   ├── 📕 04_Tech_Stack_Justification.md.pdf
│   ├── 📝 05_System_Architecture.md
│   ├── 📕 05_System_Architecture.md.pdf
│   ├── 📝 06_Database_Design.md
│   ├── 📕 06_Database_Design.md.pdf
│   ├── 📝 07_Folder_Structure.md
│   ├── 📕 07_Folder_Structure.md.pdf
│   ├── 📝 08_API_Design.md
│   ├── 📕 08_API_Design.md.pdf
│   ├── 📝 09_AI_Pipeline.md
│   ├── 📕 09_AI_Pipeline.md.pdf
│   ├── 📝 10_UIUX_Design.md
│   ├── 📕 10_UIUX_Design.md.pdf
│   ├── 📝 11_Development_Roadmap.md
│   ├── 📕 11_Development_Roadmap.md.pdf
│   ├── 📝 12_Implementation_Notes.md
│   ├── 📕 12_Implementation_Notes.md.pdf
│   ├── 📝 14_Deployment_Guide.md
│   ├── 📝 15_Future_Scope.md
│   ├── 📕 SentinelCut_MVP_Scope.md.pdf
│   ├── 📕 TEAM_PLAN.md.pdf
│   ├── 📕 all docs.pdf
│   ├── 📕 api-contract.md.pdf
│   ├── ⚙️ detection-schema.json
│   └── 📕 ilovepdf_merged.pdf
├── 📁 frontend
│   ├── 📁 public
│   │   ├── 📁 assets
│   │   │   ├── 📁 icons
│   │   │   └── 📁 images
│   │   └── 📄 favicon.ico
│   ├── 📁 src
│   │   ├── 📁 app
│   │   │   ├── 📁 (admin)
│   │   │   │   ├── 📁 admin
│   │   │   │   │   ├── 📁 analytics
│   │   │   │   │   │   └── 📄 page.js
│   │   │   │   │   ├── 📁 dictionary
│   │   │   │   │   │   └── 📄 page.js
│   │   │   │   │   ├── 📁 feedback
│   │   │   │   │   │   └── 📄 page.js
│   │   │   │   │   ├── 📁 files
│   │   │   │   │   │   └── 📄 page.js
│   │   │   │   │   ├── 📁 users
│   │   │   │   │   │   └── 📄 page.js
│   │   │   │   │   └── 📄 page.js
│   │   │   │   └── 📄 layout.js
│   │   │   ├── 📁 (app)
│   │   │   │   ├── 📁 dashboard
│   │   │   │   │   └── 📄 page.js
│   │   │   │   ├── 📁 files
│   │   │   │   │   └── 📁 [fileId]
│   │   │   │   │       ├── 📁 editor
│   │   │   │   │       │   └── 📄 page.js
│   │   │   │   │       ├── 📁 export
│   │   │   │   │       │   └── 📄 page.js
│   │   │   │   │       └── 📁 processing
│   │   │   │   │           └── 📄 page.js
│   │   │   │   ├── 📁 history
│   │   │   │   │   └── 📄 page.js
│   │   │   │   ├── 📁 profile
│   │   │   │   │   └── 📄 page.js
│   │   │   │   ├── 📁 settings
│   │   │   │   │   └── 📄 page.js
│   │   │   │   ├── 📁 upload
│   │   │   │   │   └── 📄 page.js
│   │   │   │   └── 📄 layout.js
│   │   │   ├── 📁 (auth)
│   │   │   │   ├── 📁 forgot-password
│   │   │   │   │   └── 📄 page.js
│   │   │   │   ├── 📁 login
│   │   │   │   │   └── 📄 page.js
│   │   │   │   ├── 📁 signup
│   │   │   │   │   └── 📄 page.js
│   │   │   │   └── 📄 layout.js
│   │   │   ├── 📁 (marketing)
│   │   │   │   ├── 📁 pricing
│   │   │   │   │   └── 📄 page.js
│   │   │   │   ├── 📄 layout.js
│   │   │   │   └── 📄 page.js
│   │   │   ├── 🎨 globals.css
│   │   │   ├── 📄 layout.js
│   │   │   └── 📄 page.js
│   │   ├── 📁 components
│   │   │   ├── 📁 admin
│   │   │   ├── 📁 auth
│   │   │   ├── 📁 dashboard
│   │   │   │   └── 📄 page.js
│   │   │   ├── 📁 shared
│   │   │   │   ├── 📄 Navbar.jsx
│   │   │   │   └── 📄 Sidebar.jsx
│   │   │   ├── 📁 timeline-editor
│   │   │   │   ├── 📄 DetectionHighlight.jsx
│   │   │   │   ├── 📄 EditActionsToolbar.jsx
│   │   │   │   ├── 📄 PlaybackControls.jsx
│   │   │   │   └── 📄 TranscriptView.jsx
│   │   │   ├── 📁 ui
│   │   │   └── 📁 upload
│   │   ├── 📁 hooks
│   │   │   ├── 📄 useAuth.js
│   │   │   ├── 📄 useFileUpload.js
│   │   │   ├── 📄 useJobStatus.js
│   │   │   └── 📄 useTimelineEditor.js
│   │   ├── 📁 lib
│   │   │   ├── 📄 api-client.js
│   │   │   ├── 📄 constants.js
│   │   │   ├── 📄 supabase-client.js
│   │   │   └── 📄 validators.js
│   │   ├── 📁 schemas
│   │   │   ├── 📄 apiSchema.js
│   │   │   ├── 📄 detectionSchema.js
│   │   │   ├── 📄 fileSchema.js
│   │   │   └── 📄 userSchema.js
│   │   └── 📁 store
│   │       ├── 📄 authStore.js
│   │       └── 📄 editorStore.js
│   ├── 📁 tests
│   │   ├── 📁 component
│   │   ├── 📁 e2e
│   │   └── 📁 unit
│   ├── ⚙️ .eslintrc.json
│   ├── ⚙️ .gitignore
│   ├── ⚙️ .prettierrc
│   ├── 📝 README.md
│   ├── 📄 dev-log.txt
│   ├── ⚙️ jsconfig.json
│   ├── 📄 next.config.mjs
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   ├── 📄 postcss.config.mjs
│   └── 📄 tailwind.config.js
├── 📁 infra
│   ├── 📁 docker
│   │   ├── 📄 backend.Dockerfile
│   │   ├── 📄 frontend.Dockerfile
│   │   └── 📄 worker.Dockerfile
│   ├── 📁 supabase
│   │   ├── ⚙️ config.toml
│   │   └── 📄 rls_policies.sql
│   ├── ⚙️ docker-compose.dev.yml
│   ├── ⚙️ render.yaml
│   └── ⚙️ vercel.json
├── 📁 scripts
│   ├── 🐍 benchmark_asr.py
│   ├── 🐍 benchmark_detection.py
│   ├── 🐍 generate_test_media.py
│   ├── 📄 run_migrations.sh
│   ├── 📄 seed_database.sh
│   └── 📄 setup_dev_env.sh
├── 📁 sentinelcut
├── 📁 tests
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── 📝 CHANGELOG.md
├── 📝 CONTRIBUTING.md
├── 📄 LICENSE
├── 📝 README.md
├── 📝 TEAM_PLAN.md
├── 📄 creens, app shell, upload page, Supabase auth integration, Tailwind config fixes
└── ⚙️ docker-compose.yml
```

---
*Generated by FileTree Pro Extension*