module.exports = {
    apps: [
        {
            name: 'pure-sakura-spa',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            cwd: '/var/www/puresakurahealing.com',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
        },
    ],
};
