const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const mongoose = require('mongoose');
const Post = mongoose.model('Post');

router.get('/all_post', async (req, res) => {
  await Post.find()
    .populate('postedBy', '_id name pic')
    .populate('comments.postedBy', '_id name')
    .populate('comments')
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/getsubpost', requireLogin, (req, res) => {
  // if postedBy in following
  Post.find({ postedBy: { $in: req.user.following } })
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name')
    .populate('comments')
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post('/create_post', requireLogin, (req, res) => {
  const { title, body, pic } = req.body;
  console.log(req.body);
  if (!title || !body || !pic) {
    return res.status(422).json({ error: 'Please add all the fields' });
  }
  req.user.password = undefined;
  const post = new Post({
    title,
    body,
    photo: pic,
    postedBy: req.user
  });
  post
    .save()
    .then((result) => {
      res.json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/my_posts', requireLogin, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate('postedBy', '_id name')
    .then((my_post) => {
      res.json({ my_post });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put('/like', requireLogin, (req, res) => {
  console.log(req.body);
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id }
    },
    {
      new: true
    }
  )
    .populate('likes', '_id name')
    .then((res) => res.json())
    .then((result) => console.log(result))
    .catch((err) => console.log(err));
});

router.put('/unlike', requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id }
    },
    {
      new: true
    }
  )
    .then((res) => res.json())
    .then((result) => console.log(result))
    .catch((err) => console.log(err));
});

router.put('/comment', requireLogin, (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user._id
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment }
    },
    {
      new: true
    }
  )
    .then((res) => {})
    .then((result) => console.log(result))
    .catch((err) => console.log(err));
});

router.delete('/delete_post/:postId', requireLogin, async (req, res, next) => {
  const data = await Post.findById(req.params.postId).populate(
    'postedBy',
    '_id'
  );
  try {
    if (req.user._id.toString() === data.postedBy._id.toString()) {
      await Post.deleteOne({ _id: req.params.postId });
      res.json('Post Deleted');
    }
  } catch (error) {
    console.log(error);
  }
});

router.delete('/deletecomment/:postId/:commentId', requireLogin, (req, res) => {
  Post.findById(req.params.postId)
    .populate('comments.postedBy', '_id name')
    .populate('postedBy', '_id name pic')
    .then((post) => {
      console.log(post.comments.indexOf(req.params.commentId));
      post.comments.splice(removeIndex, 1);
      post
        .save()
        .then((result) => {
          res.json(result);
        })
        .catch((err) => console.log(err));
      console.log('removeIndex is: ' + post.comments);
      // if (err || !post) {
      //   return res.status(422).json({ message: 'Some error occured!!' });
      // }
      // const comment = post.comments.find(
      //   (comment) => comment._id.toString() == req.params.commentId.toString()
      // );
      // if (comment.postedBy._id.toString() === req.user._id.toString()) {
      //   const removeIndex = post.comments
      //     .map((comments) => comments._id.toString())
      //     .indexOf(req.params.commentId);
      //   post.comments.splice(removeIndex, 1);
      //   post
      //     .save()
      //     .then((result) => {
      //       res.json(result);
      //     })
      //     .catch((err) => console.log(err));
      //   console.log('removeIndex is: ' + post.comments);
      // }
    });
});

module.exports = router;
