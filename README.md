# 📋 Task Manager API

REST API full-stack per gestione attività, clienti e progetti. Backend in **C# .NET 10** deployato su **Render**.

## 🚀 Live Demo

- **API**: https://task-manager-api-2-8pjn.onrender.com/api/tasks
- **Frontend**: https://task-manager-frontend-ativ.vercel.app
- **Repository**: https://github.com/Dima93ts/task-manager-api

## ✨ Features

✅ CRUD completo task (create, read, update, delete)  
✅ API REST con endpoint strutturati  
✅ CORS configurato per origini multiple  
✅ Modello task ricco: cliente, progetto, priorità, scadenza, ore stimate  
✅ Status task: da fare → in corso → completato  
✅ Deploy automatico da GitHub su Render  

## 📦 Tech Stack

- **Linguaggio**: C# 12
- **Framework**: ASP.NET Core 10.0
- **Web Server**: Kestrel
- **CORS**: Abilitato per Vercel
- **Deploy**: Docker + Render.com

## 🔌 API Endpoints

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/tasks` | Lista tutti i task |
| GET | `/api/tasks/{id}` | Dettagli task |
| POST | `/api/tasks` | Crea nuovo task |
| PUT | `/api/tasks/{id}` | Aggiorna task |
| DELETE | `/api/tasks/{id}` | Elimina task |

### Esempio Request

**POST /api/tasks**
```json
{
  "clientName": "ACME SRL",
  "projectName": "Sito v2",
  "title": "Setup progetto",
  "description": "Creare repo e pipeline base",
  "priority": "high",
  "estimatedHours": 4,
  "dueDate": "2026-01-11T16:05:11.689Z"
}
