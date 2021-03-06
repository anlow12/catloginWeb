var catPage = angular.module('catPage',['ngRoute', 'angular-jwt']);

catPage.config(function($routeProvider, $locationProvider, $httpProvider, jwtInterceptorProvider){
    
    jwtInterceptorProvider.tokenGetter = function(){        
        return localStorage.getItem('id_token');
    }
    
    $httpProvider.interceptors.push('jwtInterceptor');
    
    $routeProvider
    .when('/login', {
        templateUrl: "pages/main.html",
        controller: 'mainController'
    })
    .when('/', {
        templateUrl: "pages/loggedOn.html",
        controller: 'loggedController',
        resolve: {
            factory: checkToken
        }
    })
    .when('/admin', {
        templateUrl: "pages/admin.html",
        controller: 'adminController',
        resolve: {
            factory: checkToken
        }
    })
    .otherwise({ redirectTo:'/' });
});

catPage.controller('mainController', ['$scope', '$http', '$window', "$location", function($scope, $http, $window, $location){
    var localHost = "https://pure-forest-39604.herokuapp.com/";
    //var heroku = "https://pure-forest-39604.herokuapp.com/";
    
    //use username to check if that user name is valid
    $scope.userName = '';
    
    //makesure password and passwordRe fields are same
    $scope.passw1 = '';
    $scope.passw2 = '';
    
    //Hiding helpful popups
    $scope.hideID = true;
    $scope.hideConfirm = true;
    
    
    //whenever password fields are changing, run validation function
    $scope.$watch('passw1', function(){
        $scope.validate();
    });
    $scope.$watch('passw2', function(){
        $scope.validate();
    });
    
    $scope.$watch('userName', function(){
        $scope.checkID();
    });
    
    $scope.checkID = function() {
        $http.get(localHost+"api/idcheck/", {
            params: {"id": $scope.userName}})
            .success(function(data){
            if(!data.success && $scope.userName.length == 0){
                $scope.hideID = true;
            }
            
            else if(!data.success && $scope.userName.length > 0){
                $scope.errorID = false;
                $scope.classname = 'has-success';
                $scope.hideID = true;
            }
            else {
                $scope.errorID = true;
                $scope.classname = 'has-error';
                $scope.hideID = false;
                $scope.helptext = "This user name is already taken"
            }
            
        });
    }
    
    $scope.validate = function() {
        if($scope.passw1 !== $scope.passw2 && $scope.passw2.length > 0){
            $scope.errorPW = true;
            $scope.pwsame = 'has-error';
            $scope.hidePW = false;
        }
        else if($scope.passw2.length == 0) {
            $scope.hidePW = true;
        }
        else if($scope.passw1 == $scope.passw2) {
            $scope.errorPW = false;
            $scope.pwsame = 'has-success';
            $scope.hidePW = false;
            $scope.helpPWtext = "Password is matching"
        }
        $scope.incomplete = false;
        if(!$scope.userName.length || !$scope.passw1 || !$scope.passw2){
            $scope.incomplete = true;
        }
    }
    
    $scope.onClick = function () {
        $http.post(localHost+"api/loginCreate/", {
            username: $scope.userName,
            password: $scope.passw1
        }).success(function (data) {
            if(data.success){
                $scope.hideConfirm = false;
                $scope.hidePW = true;
                $http.post(localHost+"api/login/", {
                    username: $scope.userName,
                    password: $scope.passw1
                    }).success(function(data){
                        if(data.success){
                            $window.localStorage.id_token = data.token;
                            $location.path('/');
                            }
                        else if(!data.success) {
                            
                            $scope.hideLogin = false;
                            $scope.successfulLog = 'has-error';
                            $scope.disabled = false;
                            }
                        });
            }
        });
    }
    
    $scope.usernameexist='';
    $scope.passwordexist='';
    $scope.hideLogin = true;
    
    $scope.onClickLog = function() {
        $scope.successfulLog = ' ';
        $scope.hideLogin = true;
        $scope.disabled = true;
        $http.post(localHost+"api/login/", {
            username: $scope.usernameexist,
            password: $scope.passwordexist
        }).success(function(data){
            if(data.success){
                $window.localStorage.id_token = data.token;
                $location.path('/');
            }
            else if(!data.success) {
                $scope.hideLogin = false;
                $scope.successfulLog = 'has-error';
                $scope.disabled = false;
            }
        });
    } 
}]);

catPage.controller('loggedController', function($scope, $window, $http, $location, jwtHelper, toHome, logOut){
    var localHost = "https://pure-forest-39604.herokuapp.com/";
    //var heroku = "https://pure-forest-39604.herokuapp.com/";
    $scope.date = 0;
    $scope.reportCommentHide = true;
    $scope.reportSent = true;
    $scope.postButtonClicked = 0;
    
    $http.get(localHost+"api/pets/one",{
        //for future update... type should be changed
        params: {"type": 'cat', "date": $scope.date}})
        .success(function(doc){
            //console.log(doc);
            if(doc.success){
                //console.log(doc);
                $scope.idphoto = doc.data[0]._id;
                $scope.date = doc.data[0].date;
                $scope.address = doc.data[0].imglink;
                $scope.like = doc.data[0].upvote;
                $scope.photoComments = doc.data[0].photocomment;
            }
        });
    
    
    var token = $window.localStorage.getItem('id_token');
    var payload = jwtHelper.decodeToken(token);
    //console.log(payload);
    $scope.username = payload.username;
    
    
    
    $scope.onNextClick = function(){
        //console.log($scope.current);
        $scope.likeDisabled = false;
        $scope.sendDisabled = false;
        $scope.reportCommentHide = true;
        $scope.reportSent = true;
        $http.get(localHost+"api/pets/one",{
        //for future update... type should be changed
        params: {"type": 'cat', "date": $scope.date}})
        .success(function(doc){
            //console.log(doc);
            if(doc.success){
                //console.log(doc);
                $scope.idphoto = doc.data[0]._id;
                $scope.date = doc.data[0].date;
                $scope.address = doc.data[0].imglink;
                $scope.like = doc.data[0].upvote;
                $scope.photoComments = doc.data[0].photocomment;
            }
        });
    }
    
    $scope.onLikeClick = function(){
        $scope.likeDisabled = true;
        $http.post(localHost+"api/pets/upvote",{
            date: $scope.date,
            imglink: $scope.address,
            upvote: $scope.like
        }).success(function(data){
            if(data.success){
                $scope.like = $scope.like + 1;
            }
        });
    }
    
    $scope.onReportClick = function(){
        $scope.reportCommentHide ? $scope.reportCommentHide = false : $scope.reportCommentHide = true;
    }
    
    $scope.onClickSend = function(){
        $scope.sendDisabled = true;
        $http.post(localHost+"api/pets/report",{
            _id: $scope.idphoto,
            comment: $scope.reportText
        }).success(function(data){
            if(data.success){
                $scope.reportSent = false;
                $scope.reportText = null;
            }
        });
    }
    
    $scope.onClickLogout = function(){
        logOut();
    } 
    
    $scope.onClickPhotoComment = function(){
        $scope.photoComment = true;
        $scope.photoComments.push({
            content: $scope.commentText,
            user: $scope.username
        });
        
        $http.post(localHost+"api/pets/comment",{
            _id: $scope.idphoto,
            content: $scope.commentText,
            user: $scope.username
        }).success(function(data){
            $scope.commentText = null;
            $scope.photoComment = false;
        })
    }
});

catPage.controller("adminController", function($scope, $http, logOut){
    
    $scope.onClickLogout = function(){
        logOut();
    }
    
    var localHost = "https://pure-forest-39604.herokuapp.com/";
    //var heroku = "https://pure-forest-39604.herokuapp.com/";
    
    //get top 3 database(like)
    $http.get(localHost+"api/pets/toplike")
    .success(function(doc){
        if(doc.success){
            //console.log(doc);
           $scope.mostlikedposts = doc.data;
        }
    });
    
    
    //get most discussed
    $http.get(localHost+"api/pets/topdis")
    .success(function(doc){
        if(doc.success){
            //console.log(doc);
            $scope.mostdiscussedposts = doc.data;  
        }
    });
    
    //get all reports
    $http.get(localHost+"api/pets/reportsAdmin")
    .success(function(doc){
        //console.log(doc);
        $scope.reportposts = doc.data;
    });
    //upload a photo
    $scope.onClickUpload = function(){
        $scope.UploadDisbaled = true;
        //upload photo
        $http.post(localHost+"api/pets/photo",{
            data: {
                url: $scope.uploadImage,
                type: 'cat'
            }
        })
        .success(function(doc){
            $scope.UploadDisbaled = false;
            $scope.uploadImage = null;
            //console.log(doc);
        });
        
    }
    
    
    //delete photo
    $scope.onClickDelete = function(){
        $scope.deleteDisabled = true;
        //console.log($scope.deleteImage);
        $http.delete(localHost+"api/pets/delete",{
            params: {
                _id: $scope.deleteImage
            }
        })
        .success(function(doc){
            $scope.deleteDisabled = false;
            $scope.deleteImage = null;
            console.log(doc); 
        });
    }
    
});




catPage.factory('toHome', function($location){
    return function(){
        $location.path('/login');
    }
});

catPage.factory('logOut', function($location, toHome){
    return function(){
        localStorage.removeItem('id_token');
        toHome();        
    };
});

var checkToken = function($location,$window, jwtHelper) {
    
    
    if( $window.localStorage.getItem('id_token') == undefined || $window.localStorage.getItem('id_token') == null) {    
        $location.path('/login');
    }
    
    var token = $window.localStorage.getItem('id_token');
    var payload = jwtHelper.decodeToken(token);
    
    if (jwtHelper.isTokenExpired(token)){
        $location.path('/login');
    }
    
    if (payload.admin == "true"){
        $location.path('/admin');
    }
}