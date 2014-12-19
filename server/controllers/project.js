var _ = require('lodash');
var async = require('async');
var Project = require('../models/Project');

exports.postProject = function (req, res, next) {
    req.assert('name', '');
    req.assert('private', '');
    req.assert('firstName1', '');
    req.assert('personalCode1', '');
    req.assert('lastName1', '');
    req.assert('firstName2', '');
    req.assert('personalCode2', '');
    req.assert('lastName2', '');
    req.assert('adress', '');
    req.assert('zipCode', '');
    req.assert('city', '');
    req.assert('phoneNumber', '');
    req.assert('cadastral', '');
    req.assert('rotdeduction', '');
    req.assert('organizationNumber', '');
    req.assert('apartmentRental', '');
    req.assert('email', '');

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/kundform');
    }

    var project = new Project({
        name: req.body.name,
        enable: false,
        private: false,
        customer: [
            {
                firstname: req.body.firstName1,
                lastName: req.body.lastName1,
                personalCode: req.body.personalCode1,
                email: req.body.email
            },
            {
                firstname: req.body.firstName2,
                lastName: req.body.lastName2,
                personalCode: req.body.personalCode2,
                email: req.body.email
            }
        ],
        adress: {
            adress: req.body.adress,
            zipCode: req.body.zipCode,
            city: req.body.city,
            phoneNumber: req.body.phoneNumber,
            cadastral: req.body.cadastral, // Fastighetsbeteckning
            rotdeduction: req.body.rotdeduction,
            organizationNumber: req.body.organizationNumber,
            apartmentRental: req.body.apartmentRental // Lägenhetsnummer
        },
        jobs: []
    });

    Project.findOne({
        name: req.body.project
    }, function (err, existingProject) {
        if (existingProject) {
            req.flash('errors', {
                msg: 'Ett project med de här namnet finns redan.'
            });
            return res.redirect('/kundform');
        }
        project.save(function (err) {
            if (err) return next(err);
            req.flash('succes', {
                msg: 'Projectet skapades.'
            });
            console.log(req.session.flash);
            return res.redirect('/kundform');
        });
    });

};

exports.postJob = function (req, res, next) {
    req.assert('project', '');
    req.assert('workActivities', '');
    req.assert('busMaterials', '');
    req.assert('hours', '');
    req.assert('trips', '');
    req.assert('date', '');


    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/');
    }

    var job = {
        username: req.user.username,
        workActivities: req.body.workActivities,
        busMaterials: req.body.busMaterials,
        hours: req.body.hours,
        trips: req.body.trips,
        date: req.body.date
    };

    Project.findOneAndUpdate({
        name: req.body.project
    }, { $push: { jobs: job } },
    function(err){
        if (err) {
            return next(err);
        } else {
            console.log("Successfully added");
        }
    });
};

 /**
  * GET /projectlist
  * JSON accounts api
  */
 exports.projectList = function (req, res) {
     Project.findOne({
        name: 1
     }, { jobs: 1, _id: 0},
    function (err, items) {
         if (err) {
             return (err, null);
         }
         res.json(items);
     });
 };

 /**
  * GET /projectnames
  * JSON accounts api
  */
 exports.projectNames = function (req, res) {
     Project.findOne({},
    { name: 1, _id: 0},
    function (err, items) {
         if (err) {
             return (err, null);
         }
         res.json(items);
     });
 };

/**
 *
 */
 exports.projectUserJobs = function (req, res) {
     Project.aggregate([
         // Tar bara med documents som matchar
         {
            $match: {
                'jobs.username': req.query.clickedUser
            }
         },
         // $project har inget och göra med att vi håller på med projects,
         // utan den anvgör vilka fält som ska retuneras
         {
            $project: {
                _id: 0,
                name: 1,
                jobs: 1
            }
         },
         // Kolla mer på :P :P:P :P:PS:DPSD:
         {
            $unwind: '$jobs'
         },
         // Tar bara med elementen som matchar
         {
            $match: {
                'jobs.username': req.query.clickedUser
            }
         },
         // Sorterar alla job efter datum
         {
            $sort: {
                'jobs.date': 1
            }
         }
    ], function (err, items) {
         if (err) {
             return (err, null);
         }
         res.json(items);
     });
 };
