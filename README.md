\# AgriTrack AI



AgriTrack AI is an Android-based agricultural fleet and vehicle management application designed to help manage agricultural operations, vehicles, drivers, farms, devices, GPS tracking, maintenance, expenses, and operational data.



The project consists of an Android mobile application and a Node.js backend API.



\## Project Structure



```text

Agri-Track-AI/

│

├── android/                 # Android mobile application

│   ├── app/

│   ├── gradle/

│   ├── build.gradle.kts

│   └── settings.gradle.kts

│

├── backend/                 # Node.js backend API

│   ├── ai/

│   ├── controllers/

│   ├── models/

│   ├── routes/

│   ├── services/

│   ├── tests/

│   ├── app.js

│   ├── server.js

│   └── package.json

│

├── .gitignore

└── README.md



\## Technologies Used



\### Android

\- Kotlin

\- Jetpack Compose

\- Material 3

\- MVVM Architecture

\- Kotlin Coroutines

\- Retrofit

\- Android Location Services



\### Backend

\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- JWT Authentication

\- REST APIs

\- Socket.IO

\- Vitest



\## Key Features



\- User authentication and authorization

\- Role-based access control

\- Vehicle and machine management

\- Driver management

\- Farm and field management

\- GPS and location tracking

\- Device management

\- Maintenance management

\- Fuel and expense tracking

\- Notifications and alerts

\- Reports and trip history

\- AI-assisted functionality



\## Architecture



Android Application

&#x20;       |

&#x20;       | REST API

&#x20;       v

Node.js + Express Backend

&#x20;       |

&#x20;       +-- Authentication

&#x20;       +-- Business Logic

&#x20;       +-- AI Services

&#x20;       +-- GPS \& Vehicle Services

&#x20;       |

&#x20;       v

MongoDB Database



\## Setup



\### Backend



```bash

cd backend

npm install



\## Setup



\### Backend



```bash

cd backend

npm install





\### 7. Security



```markdown

\## Security



Environment files containing credentials and secrets are excluded from this repository.



Do not commit:



\- `.env`

\- `.env.development`

\- `.env.production`

\- `.env.staging`



\## Author



\*\*Sai Kiran Reddy Chirra\*\*



GitHub: https://github.com/saikiranreddy-16



Agri-Track-AI/

├── android/        # Android application

├── backend/        # Node.js + Express backend

├── .gitignore

└── README.md

