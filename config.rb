# Compass CSS framework config file

require 'susy'
require 'modular-scale'
require 'accoutrement'
require 'animate'
require 'breakpoint'
# Require any additional compass plugins here.

project_type = :stand_alone
# Set this to the root of your project when deployed:
http_path = "/"
sass_dir = "sass"
css_dir = "static/css"
images_dir = "static/images"
fonts_dir = "static/fonts"
javascripts_dir = "static/js"
line_comments = false
preferred_syntax = :scss
output_style = :compact
relative_assets = true

# remove cache-busting for mobile apps
# asset_cache_buster do |http_path, real_path|
#   nil
# end
