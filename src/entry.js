'use strict';

var angular = require('angular');
var app = angular.module('SemverApp', []);
var semver = require('semver');

var REGISTRY_CORS_PROXY = 'https://cors-proxy-ee2bb0df.internal.npmjs.com';

app.controller('VersionCtrl', function($scope, $http, $location) {
  var versions;
  var latest;
  var distTags;
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
        distTags = data['dist-tags'];
        latest = distTags.latest;

        $scope.versions = versions.map(function(v) {
          return {
            "version": v
          }
        })

        $scope.checkVersions = function() {
          var maxVersion = latest
          if (!semver.satisfies(maxVersion, $scope.range)) maxVersion = null;
          for (var i=0, len=versions.length; i<len; i++) {
            $scope.versions[i].satisfies = distTags[$scope.range] === $scope.versions[i].version ||
              (semver.satisfies($scope.versions[i].version, $scope.range) &&
               (!maxVersion || semver.lte($scope.versions[i].version, maxVersion)));
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
