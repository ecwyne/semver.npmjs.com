'use strict';

var angular = require('angular');
var app = angular.module('SemverApp', []);
var semver = require('semver');

var REGISTRY_CORS_PROXY = 'https://cors-proxy-ee2bb0df.internal.npmjs.com';

var encodePackageUri = function(pkg) {
  var ORG_REGEX = /(^@)(.*)/;
  var ret = pkg;
  var matches = pkg.match(ORG_REGEX);

  if (matches) {
    ret = matches[1] + encodeURIComponent(matches[2]);
  }

  return ret;
}

app.controller('VersionCtrl', function($scope, $http) {
  var versions;
  $scope.package = 'lodash';

  $scope.getVersions = function() {
    $scope.loading = true;
    $http.get(REGISTRY_CORS_PROXY + '/' + encodePackageUri($scope.package))
      .success(function(data, status, headers, config) {
        versions = Object.keys(data.versions);

        $scope.range = '1.x'
        $scope.versions = versions.map(function(v) {
          return {
            "version": v
          }
        })

        $scope.checkVersions = function() {
          for (var i=0, len=versions.length; i<len; i++) {
            $scope.versions[i].satisfies = semver.satisfies($scope.versions[i].version, $scope.range);
          }
        }

        $scope.checkVersions();
        $scope.loading = false;
      })
      .error(function(data, status, headers, config) {
        $scope.loading = false;

        console.log('Sorry, could not load data.')
      });
  }

  $scope.getVersions();
});
