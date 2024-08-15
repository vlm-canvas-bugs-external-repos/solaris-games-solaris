# QUICKSTART Guide for Solaris Games

## Prerequisites
- **Node.js (v20)**
- **MongoDB (v5.0)**
- **Docker** and **Docker Compose**

## Running the Application with Docker

### Steps to Run the Application

1. **Set Up `.env` Files**:
   - Ensure that both the `server/.env` and `client/.env` files are properly set up and contain the required configurations (default `.env` files are fine).

2. **Clone the Repository** (if you haven't already):
   ```bash
   git clone <repository_url>
   cd solaris-games-solaris
   ```

3. **Set Up Docker Compose**:
   - Make sure the `docker-compose.yml` file is located in the root directory of your repository.

4. **Run Docker Compose**:
   - In the main directory of the repository, run the following command:
   ```bash
   docker-compose up
   ```
   - This command will build and start all the services defined in the `docker-compose.yml` file.

5. **Access the Application**:
   - Once the application services are up and running, open your web browser and navigate to:
   ```
   http://localhost:8080
   ```

### Optional: Running in Detached Mode
If you prefer to run Docker in the background:
```bash
docker-compose up -d
```

### Monitoring Logs
If you run in detached mode and want to see the logs:
```bash
docker-compose logs -f
```

### Stopping the Application
To stop the running Docker containers, use:
```bash
docker-compose down
```

---

By following these steps, you should be able to run the `solaris-games-solaris` application using Docker seamlessly.