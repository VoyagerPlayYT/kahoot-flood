FROM node:18-slim  

RUN apt-get update && \  
    apt-get install -y \  
    python3 \  
    build-essential \  
    git \  
    ca-certificates \  
    && rm -rf /var/lib/apt/lists/*  
