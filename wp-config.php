<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information
 * by visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('WP_CACHE', true); //Added by WP-Cache Manager
define( 'WPCACHEHOME', '/mnt/stor12-wc1-ord1/891023/947274/www.umfo.hr/web/content/wp-content/plugins/wp-super-cache/' ); //Added by WP-Cache Manager
define('DB_NAME', '947274_umfo');

/** MySQL database username */
define('DB_USER', '947274_umfo');

/** MySQL database password */
define('DB_PASSWORD', '9d12ed3E76');

/** MySQL hostname */
define('DB_HOST', 'mysql51-126.wc1.ord1.stabletransit.com');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '5r5)*P0;vxw)>*jQx|SLcXt8af2Zlt@>UD8z/Esm#Z41Foe$n7nArQIB7L|.^!&y');
define('SECURE_AUTH_KEY',  'cL93?]q1Yuo1SC%&7|ezQX!k6!a_I,iVA?Yo<><LhbM!OpPVp4:^o4]vC9f-]xDy');
define('LOGGED_IN_KEY',    'l0W8>JT5V4&8tu5S[XvkpuQ2D6KB0<!m<vu#^<(y.XHk,9$+775:BWU%p2eq?<M$');
define('NONCE_KEY',        'i*O[5uuV,@^*-Q3OX9I}s0@S3?(;$t6:9h?$MixC/bh#2-pnQ8k)9"z@-g4WKxPT');
define('AUTH_SALT',        'PDv|V4BN%ToEBN2.i=0,*711osk910qdaWd7nOi|5GDG/3xa?4|7c1vB/P7Rny6y');
define('SECURE_AUTH_SALT', 'cL93?]q1Yuo1SC%&7|ezQX!k6!a_I,iVA?Yo<><LhbM!OpPVp4:^o4]vC9f-]xDy');
define('LOGGED_IN_SALT',   '940/EYCwuE=c8+cG4H40E+DdFu{B*)T,<q)q>jXiXHv6tIax>e5r0JFF$B&TjyI6');
define('NONCE_SALT',       'ZpxNI;64z]!3H-]u{4W{N|BoBg*VPo2cN{Z"?t]os9,0Q>1N;XJFX_5}0KSP9i2j');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress. A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de_DE.mo to wp-content/languages and set WPLANG to 'de_DE' to enable German
 * language support.
 */
define('WPLANG', 'hr_HR');

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);
define('WP_DEBUG_DISPLAY', false);

define('WP_HOME', 'http://' . $_SERVER['HTTP_HOST']);
define('WP_SITEURL', 'http://' . $_SERVER['HTTP_HOST']);
define('WP_CONTENT_URL', '/wp-content');
define('DOMAIN_CURRENT_SITE', $_SERVER['HTTP_HOST']);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
