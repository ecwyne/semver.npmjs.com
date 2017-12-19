'use strict';

var angular = require('angular');
var app = angular.module('SemverApp', []);
var semver = require('semver');

var REGISTRY_CORS_PROXY = 'https://cors-proxy-ee2bb0df.internal.npmjs.com';

app.controller('VersionCtrl', function($scope, $http, $location) {
  var versions;
  $scope.package = $location.search().package || 'lodash';
  $scope.range = $location.search().range || '1.x';

  $scope.updateLocation = function() {
    $location.search({package: $scope.package, range: $scope.range});
  }
  
  $scope.getVersions = function() {
    $scope.loading = true;
    $http.get(REGISTRY_CORS_PROXY + '/' + $scope.package.replace('/', '%2f'))
      .success(function(data, status, headers, config) {
        versions = Object.keys(data.versions);

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
    $scope.updateLocation();
  }

  $scope.getVersions();
});
