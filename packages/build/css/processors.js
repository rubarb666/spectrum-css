/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const postcssReal = require('postcss');

var processors = [
  require('postcss-import'),
  require('postcss-mixins')({
    mixins: {
      typography: function(mixin, name, tokenName, textTransformIgnore) {
        if(!tokenName) {
          tokenName = name.replace(/\.?([A-Z]|[0-9])/g, function (x,y) { return '-' + y.toLowerCase(); }).replace(/^-/, '');
          tokenName = tokenName.replace('.spectrum--', '');
        }
        var output = '';
        var propMap = {
          'font-size': 'text-size',
          'font-weight': 'text-font-weight',
          'line-height': 'text-line-height',
          'font-style': 'text-font-style',
          'letter-spacing': 'text-letter-spacing',
          'text-transform': 'text-transform',
        };
        function buildProperties (tokeString) {
          var ruleString = '';
          Object.keys(propMap).forEach((key) => {
            if(!textTransformIgnore || key != 'text-transform') {
              ruleString += `  ${key}: var(--spectrum-${tokeString}-${propMap[key]});\n`;
            }
          });
          ruleString += '  margin-top: 0;\n  margin-bottom: 0;\n';
          return ruleString;
        }
        output = `${name} {
        ${buildProperties(tokenName)}
          em {
            ${buildProperties(`${tokenName}-emphasis`)}
          }
          strong {
            ${buildProperties(`${tokenName}-strong`)}
          }
        }`;
        var nodes = postcssReal.parse(output);
        nodes.nodes[0].append(mixin.nodes);
        mixin.replaceWith(nodes);
      },
      typographyColor: function(mixin, name, tokenName) {
        if(!tokenName) {
          tokenName = name.replace(/\.?([A-Z]|[0-9])/g, function (x,y) { return '-' + y.toLowerCase(); }).replace(/^-/, '');
          tokenName = tokenName.replace('.spectrum--', '');
        }
        var output = `${name} {
          color: var(--spectrum-${tokenName}-text-color);
        }`;
        var nodes = postcssReal.parse(output);
        nodes.nodes[0].append(mixin.nodes);
        mixin.replaceWith(nodes);
      },
      typographyMargins: function(mixin, name, tokenName) {
        if(!tokenName) {
          tokenName = name.replace(/\.?([A-Z]|[0-9])/g, function (x,y) { return '-' + y.toLowerCase(); }).replace(/^-/, '');
          tokenName = tokenName.replace('.spectrum--', '');
        }
        var output = `${name} {
          margin-top: var(--spectrum-${tokenName}-margin-top);
          margin-bottom: var(--spectrum-${tokenName}-margin-bottom);
        }`;
        var nodes = postcssReal.parse(output);
        nodes.nodes[0].append(mixin.nodes);
        mixin.replaceWith(nodes);
      }
    }
  }),
  require('postcss-nested'),
  require('postcss-inherit'),
  require('postcss-custom-properties')({
    noValueNotifications: 'error',
    warnings: false
  }),
  require('./lib/postcss-custom-properties-passthrough')(),
  require('postcss-calc'),
  require('./lib/postcss-custom-properties-mapping'),
  require('./lib/postcss-notnested')({ replace: '.spectrum' }),
  require('postcss-functions')({
    functions: {
      noscale: function(value) {
        return value.toString().toUpperCase();
      },
      percent: function(value) {
        return parseInt(value, 10) / 100;
      }
    }
  }),
  require('./lib/postcss-strip-comments')({ preserveTopdoc: false }),
  require('postcss-focus-ring'),
  require('autoprefixer')({
    'browsers': [
      'IE >= 10',
      'last 2 Chrome versions',
      'last 2 Firefox versions',
      'last 2 Safari versions',
      'last 2 iOS versions'
    ]
  })
];

module.exports = processors;
