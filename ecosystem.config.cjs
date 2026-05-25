module.exports = {
  apps: [
    {
      name: "hypermsg-api",
      script: "dist/src/server.js",
      cwd: "/opt/hypermsg",
      env: {
        NODE_ENV: "production"
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "600M"
    },
    {
      name: "hypermsg-worker",
      script: "dist/src/workers/messageWorker.js",
      cwd: "/opt/hypermsg",
      env: {
        NODE_ENV: "production"
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "600M"
    },
    {
      name: "hypermsg-webhook-worker",
      script: "dist/src/workers/webhookWorker.js",
      cwd: "/opt/hypermsg",
      env: {
        NODE_ENV: "production"
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "400M"
    }
  ]
};
