module.exports = {
    /**
     * @param {{ module: { rules: { test: RegExp; issuer: { test: RegExp; }; use: string[]; }[]; }; }} config
     */
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            issuer: {
                test: /\.(js|ts)x?$/,
            },
            use: ['@svgr/webpack'],
        })

        return config;
    },
}