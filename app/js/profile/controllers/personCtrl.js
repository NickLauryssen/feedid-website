'use strict';

class PersonCtrl {

    constructor($scope, $rootScope, $http, $location, $routeParams) {
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$http = $http;
        this.$location = $location;
        this.$routeParams = $routeParams;

        this.client = {};
        this.countries = [];
        this.userId = $routeParams.userId;
        this.tests = [];
        this.testResults = [];
        this.app = {};
        this.$rootScope.editorEnabled = false;
        this.releaseBtn = false;
        this.editBtn = false;
        this.canDoAdmin = false;
    }

    init() {
        if (($rootScope.currentUser._id =='54e83de7b752bfa10e47d8bf') || ($rootScope.currentUser._id =='5502409dd4ac39257ca71f86') || ($rootScope.currentUser._id =='54feefcccf4100975819aeeb')){
            this.canDoAdmin = true;
        }

        //get countries
        this.$http.get(url + '/api/countries').success((countries) => {
            for (var c in countries)
                this.countries.push(countries[c]);

        });

        //get App
        this.$http.get(url + '/api/apps/Profile').success((resultApp) => {
            this.app = resultApp;
        });

        /**
         * This function is responsible for the content of the google charts.
         */
        this.$http.get(url + '/api/apps/Profile').success((resultApp) => {
            this.app = resultApp;
            this.$http.get(url + '/api/users/' + this.userId + '/' + this.app._id).success((user) => {
                this.user = user; //visible User

                if (!this.user.validated) {
                    var owner_id = this.$rootScope.currentUser._id;
                    var user_id = this.user._id;
                    //get app to make sure it is set (I made another get app request here because sometimes this userapps request was sent before app was set)


                    this.$http.get(url + '/api/userapps/' + owner_id + '/' + user_id + '/' + this.app._id)
                        .success((userapp) => {
                            if (userapp._id) {
                                this.releaseBtn = true;
                                this.editBtn = true;
                            }
                        });
                }

                if (this.$rootScope.currentUser._id == this.user._id) {
                    this.editBtn = true;
                }

                /**
                 * These charts are filled with testresults for this test.
                 * The testresults are unique for a specific user.
                 */
                this.$http.get(url + '/api/tests/'+ this.user._id).success((tests) => {
                    for (var i in tests) {
                        this.tests.push(tests[i]);
                    }
                    this.selectedTest = tests[0];

                    /**
                     * Get all testresults from a specific user.
                     */
                    this.$http.get(url + '/api/testresults/' + this.user._id).success((testResults) => {

                        for (var i in testResults)
                            if (testResults[i]== null){
                             this.tests = [];
                            } else{
                                this.testResults = testResults;
                            }

                        /**
                         * For each test we make a new chart and store them in a charts array.(array == store of all test charts)
                         * Some configurations are made for the chart.
                         * The cols[] array represents the X-axis of the graph.
                         * The rows[] array will represent the Y-axis data.
                         */

                        for (var k in this.tests) {
                            var testId = this.tests[k]._id;
                            var aChart = {};
                            aChart.type = "LineChart";
                            aChart.displayed = "true";
                            aChart.data = {};
                            var cols = [];
                            var rows = [];
                            cols.push({"id": "time", "label": "Time", "type": "string", "p": {}});
                            for (var sub in this.tests[k].subTests) {
                                cols.push({
                                    "id": this.tests[k].subTests[sub].name,
                                    "label": this.tests[k].subTests[sub].name,
                                    "type": "number",
                                    "p": {}
                                });
                            }
                            aChart.data.cols = cols;
                            /**
                             * For each testresult of a user.
                             */

                            for (var res in this.testResults) {
                                if (this.testResults[res].test == testId) {
                                    var o = {};
                                    var valArray = [];
                                    valArray.push({"v": this.testResults[res].time});

                                    for (var r in this.testResults[res].subResults) {
                                        valArray.push({"v": this.testResults[res].subResults[r]});
                                    }
                                    o.c = valArray;
                                    rows.push(o);
                                }
                            }
                            aChart.data.rows = rows;
                            //$scope.charts.push(aChart);
                            if (rows.length < 1) aChart = null;
                            this.tests[k].chart = aChart;
                        }
                    });
                });
            });
        });
    }

    //register client and add client to database
    register() {
        this.$http.post(url + '/api/users', this.client).success((user) => {
	        var userApp = {
                owner: this.$rootScope.currentUser._id,
                linkuser: user._id,
                app: this.app._id
            };

		    this.userapp = userApp;

	        this.$http.post(url+'/api/userapps',this.userapp);

                /*$http.post(url + '/api/register', $scope.client)
                    .success(function(message) {

                      $rootScope.message = 'User registered and mail is sent to your email.';
                        $location.url('/login');
                    })
                    .error(function() {
                        $rootScope.message = 'Couldn\'t register user';
                    });*/
                this.$rootScope.message = "User registered!";
                this.client = {};
                alert($rootScope.message);
        }).error(() => {
                this.$rootScope.message = 'Couldn\'t register user';
                alert($rootScope.message);
        });
    }

    /**
     * Edit profile
     */

    enableEditor() {
        this.$rootScope.editorEnabled = true;
        this.editUser = this.user;
    }

    disableEditor() {
        this.$rootScope.editorEnabled = false;
    }

    save() {
        this.user = this.editUser;
        this.$http.put(url + '/api/users/' + this.editUser._id, this.editUser).success((usr) => {
            this.$rootScope.message = "User updated successfully!";
            if (this.$rootScope.currentUser._id == usr._id)
                this.$rootScope.currentUser = usr;
             alert(this.$rootScope.message);
        });
        this.disableEditor();
    }

    sendConfirmEmail() {
         this.$http.post(url + '/register', this.user)
            .success((message) => {
                alert('User registered and mail is sent to your email.');
            })
            .error(() => {
                this.$rootScope.message = 'Couldn\'t register user';
            });
    }
}

angular.module('feedID.profile').controller('PersonCtrl', PersonCtrl);
