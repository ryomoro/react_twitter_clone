import React, { useState, useEffect } from "react";
import styles from "./Feed.module.css";
import { db } from "../firebase";
import firebase from "firebase/app";
//状態管理フレームワーク
import { useSelector } from "react-redux";
import { selectUser, userSlice } from "../features/userSlice";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MessageIcon from "@material-ui/icons/Message";
import SendIcon from "@material-ui/icons/Send";

interface PROPS {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
}

interface COMMENT {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    margin: theme.spacing(1),
  },
}));

const Post: React.FC<PROPS> = (props) => {
  const classes = useStyles();
  const user = useSelector(selectUser);
  const [comment, setComment] = useState("");
  //COMMENT型の配列型
  const [comments, setComments] = useState<COMMENT[]>([
    {
      id: "",
      avatar: "",
      text: "",
      username: "",
      timestamp: null,
    },
  ]);
  const [openComments, setOpenComments] = useState(false);

  useEffect(() => {
    const unSub = db
      .collection("posts")
      .doc(props.postId)
      .collection("comments")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            username: doc.data().username,
            timestamp: doc.data().timestamp,
          }))
        );
      });
    return () => {
      unSub();
    };
    //postIdを指定することで、投稿が違う投稿になった場合に処理を再度実行する
  }, [props.postId]);

  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    //リフレッシュを防ぐため
    e.preventDefault();
    db.collection("posts").doc(props.postId).collection("comments").add({
      avatar: user.photoUrl,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: user.displayName,
    });
    setComment("");
  };

  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={styles.post_body} />
      </div>
      <div className={styles.post_header}>
        <h3>
          <span className={styles.post_headerUser}>{props.username}</span>
          <span className={styles.post_headerTime}>
            {new Date(props.timestamp?.toDate()).toLocaleString()}
          </span>
        </h3>
      </div>
      <div className={styles.post_tweet}>
        <p>{props.text}</p>
      </div>
      {props.image && (
        <div className={styles.post_tweetImage}>
          <img src="{props.image}" alt="tweet" />
        </div>
      )}
      <MessageIcon
        className={styles.comment_Icon}
        onClick={() => setOpenComments(!openComments)}
      />
      {openComments && (
        <>
          {comments.map((com) => (
            <div key={com.id} className={styles.post_comment}>
              <Avatar src={com.avatar} className={classes.small} />

              <span className={styles.post_commentUser}>@{com.username}</span>
              <span className={styles.post_commentText}>{com.text} </span>
              <span className={styles.post_headerTime}>
                {new Date(com.timestamp?.toDate()).toLocaleString()}
              </span>
            </div>
          ))}

          <form onSubmit={newComment}>
            <div className={styles.post_form}>
              <input
                className={styles.post_input}
                type="text"
                placeholder="Type new comment ..."
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setComment(e.target.value);
                }}
              />
              <button
                disabled={!comment}
                className={
                  comment ? styles.post_button : styles.post_buttonDisable
                }
                type="submit"
              >
                <SendIcon className={styles.post_sendIcon} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Post;
