# Beach Protector - Docker Deployment Guide

## 🐳 Docker Build & Deployment

### Prerequisites
- Docker installed and running
- Docker Hub account (for pushing images)

### Quick Start

#### 1. Build the Docker Image
```bash
# On Linux/Mac
chmod +x build-docker.sh
./build-docker.sh

# On Windows
build-docker.bat
```

#### 2. Run Locally
```bash
docker run -p 8080:8080 cookieranger/beachprotector:latest
```

#### 3. Run with Environment Variables
```bash
docker run -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=root \
  -e DB_PASSWORD=your_password \
  -e DB_NAME=your_database \
  cookieranger/beachprotector:latest
```

### Using Docker Compose

#### 1. Start the application
```bash
docker-compose up -d
```

#### 2. Stop the application
```bash
docker-compose down
```

#### 3. View logs
```bash
docker-compose logs -f
```

### Manual Build Steps

#### 1. Build the image
```bash
docker build -t cookieranger/beachprotector:latest .
```

#### 2. Tag for different versions
```bash
docker tag cookieranger/beachprotector:latest cookieranger/beachprotector:v1.0.0
```

#### 3. Push to Docker Hub
```bash
docker login
docker push cookieranger/beachprotector:latest
docker push cookieranger/beachprotector:v1.0.0
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `8080` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_USER` | Database username | `root` |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | - |

### Health Check

The application includes a health check endpoint:
- **URL**: `http://localhost:8080/api/health`
- **Method**: GET
- **Response**: JSON with status, timestamp, and uptime

### Production Deployment

#### Railway Deployment
1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Dockerfile
3. Set environment variables in Railway dashboard
4. Deploy!

#### Other Platforms
The Docker image is compatible with:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Heroku Container Registry

### Troubleshooting

#### Build Issues
- Ensure Docker is running
- Check available disk space
- Verify Dockerfile syntax

#### Runtime Issues
- Check container logs: `docker logs <container_id>`
- Verify environment variables
- Test health endpoint: `curl http://localhost:8080/api/health`

#### Database Connection
- For local development, use `host.docker.internal` as DB_HOST
- For production, use actual database host/IP
- Ensure database is accessible from container

### Image Details

- **Base Image**: node:20-alpine
- **Size**: ~200MB (optimized)
- **Security**: Non-root user execution
- **Health Check**: Built-in endpoint monitoring
- **Signal Handling**: Proper shutdown with dumb-init

### Performance Tips

1. **Use multi-stage builds** (already implemented)
2. **Minimize layers** (already optimized)
3. **Use .dockerignore** (already configured)
4. **Run as non-root user** (already implemented)
5. **Use health checks** (already implemented)

### Monitoring

The application exposes:
- Health check endpoint for monitoring
- Structured logging
- Process uptime tracking
- Error handling with fallbacks
