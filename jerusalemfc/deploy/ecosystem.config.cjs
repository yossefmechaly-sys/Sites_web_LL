// Configuration pm2 du site Jerusalem FC (Next.js + Payload en un seul processus).
// Démarrage : pm2 start deploy/ecosystem.config.cjs && pm2 save
// Le serveur écoute uniquement en local ; Nginx fait le lien avec l'extérieur (voir nginx-jerusalemfc.conf).
module.exports = {
  apps: [
    {
      name: 'jerusalemfc',
      cwd: '/var/www/jerusalemfc',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3100 -H 127.0.0.1',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--no-deprecation',
      },
      // Instance partagée avec d'autres sites : on redémarre si la mémoire dérive
      max_memory_restart: '700M',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      time: true,
      out_file: '/var/log/jerusalemfc/out.log',
      error_file: '/var/log/jerusalemfc/error.log',
    },
  ],
}
