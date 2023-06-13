const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const User = mongoose.model('User');

router.get('/user/:id', (req, res) => {
  User.findOne({ _id: req.params.id })
    .select('-password')
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate('postedBy', '_id name')
        .then((posts) => {
          res.json({ user, posts });
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    })
    .catch((err) => {
      return res.status(404).json({ error: 'User not found' });
    });
});

router.put('/follow', requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id }
    },
    {
      new: true
    }
  )
    .select('-password')
    .populate('followers', '_id name')
    .populate('following', '_id name')
    .then((result) => {
      //   console.log(result);
      res.json(result);
      if (!result) {
        return res.status(422).json({ error: err });
      }
    });

  User.findByIdAndUpdate(
    req.user._id,
    {
      $push: { following: req.body.followId }
    },
    {
      new: true
    }
  )
    .select('-password')
    .populate('followers', '_id name')
    .populate('following', '_id name')
    .then((result) => {
      //   console.log(result);
      //   res.json(result);
      if (!result) {
        return res.status(422).json({ error: err });
      }
    });
});

router.put('/unfollow', requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { followers: req.user._id }
    },
    {
      new: true
    }
  )
    .select('-password')
    .populate('followers', '_id name')
    .populate('following', '_id name')
    .then((result) => {
      //   console.log(result);
      res.json(result);
      if (!result) {
        return res.status(422).json({ error: err });
      }
    });

  User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { following: req.body.unfollowId }
    },
    {
      new: true
    }
  )
    .select('-password')
    .populate('followers', '_id name')
    .populate('following', '_id name')
    .then((result) => {
      //   res.json(result);
      if (!result) {
        return res.status(422).json({ error: err });
      }
    });
});

router.put('/updatepic', requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { pic: req.body.pic } },
    { new: true }
  ).then((result) => {
    res.json(result);
  });
});

module.exports = router;
