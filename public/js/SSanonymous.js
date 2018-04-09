function createAnonPost($routeParams) {
  $("#anon-post_submit").on('click', function(){
    let title = $("#post_title").val();
    let content = $("#post_content").val();

    if(title.length > 4 && content.length > 0){
      let postRef = firebase.database().ref("/Anonymous/"+$routeParams.Course_ID);
      let key = postRef.push().key;
      console.log(key);
      postRef.child(key).set({
        Title: title,
        Post_content: content,
        User_ID: firebase.auth().currentUser.uid,
        Timestamp: firebase.database.ServerValue.TIMESTAMP
      });
      window.location.href = "/#!/course/" + $routeParams.Course_ID + "/Anonymous/" + key;
    }
  });
}

function getAnonCoursePostList(routeParams) {
  let post_ref = firebase.database().ref("Anonymous/" + routeParams.Course_ID);
  let post_list = [];

  post_ref.once("value", function(snapshot){
    snapshot.forEach(function(childSnapshot){
      let Post_ID = childSnapshot.key;
      let post_title = childSnapshot.val().Title;
      firebase.database().ref("Users/" + childSnapshot.val().User_ID).once('value').then(snap => {
        $("#anon-post_list").append("<a href='/#!/course/" + routeParams.Course_ID +"/Anonymous/"+ Post_ID + "' class='list-group-item'>"
          + "<h4>" + post_title + "</h4>"
          + "<i class='far fa-user'></i> <span> Anonymous </span>&nbsp;"
          + "<i class='far fa-clock'></i> <span>" + new moment(childSnapshot.val().Timestamp).fromNow() +"</span>"
          + "<p class='text-right'>View Details</p>"
          +"</a>");
      });

    })
  });
}

function changeAnonPostDisplay(routeParams){
  $("#course").text(routeParams.Course_ID);
  $("#course").attr('href', "/#!/course/" + routeParams.Course_ID);

  firebase.database().ref("Anonymous/" + routeParams.Course_ID+ "/" + routeParams.AnonPost_ID).once('value').then(snap => {
    $("#post").text(snap.val().Title);
    $("#title").text(snap.val().Title);
    $("#content").text(snap.val().Post_content);
    firebase.database().ref("Users/" + snap.val().User_ID).once('value').then(snap => {
      $("#author").text("Anonymous");
      if (firebase.auth().currentUser.uid == snap.val().uid)
      {
        $("#title_row").append("<p><div class='text-right'><a href='javascript:void(0)' class='btn btn-outline-warning'>Edit Post</a>"
                              + " <a href='javascript:void(0)' class='btn btn-outline-danger'>Delete Post</a></div></p>");
      }
    });
    $("#time_created").text(new moment(snap.val().Timestamp).fromNow());
  });

  // Load Comments
  firebase.database().ref("AnonComment/" + routeParams.AnonPost_ID).on('child_added', snap => {
    let edit_link = "";
    let delete_link = "</h6>";
    let comment_text = snap.val().Text;
    if (firebase.auth().currentUser.uid == snap.val().User_ID)
    {
      edit_link = " <a id='edit_link_"+snap.key+"' href='javascript:void(0)' style='color: red' onClick='displayEditCommentSection(\""+snap.key+"\", \""+routeParams.Post_ID+"\", true)'>Edit</a>";
      delete_link = " <a href='javascript:void(0)' style='color: red' onClick='deleteComment(\""+snap.key+"\", \""+routeParams.Post_ID+"\", true)'>Delete</a>";
      comment_text = "<div id='comment_text_"+snap.key+"'>"+snap.val().Text+"</div>";
    }

    let comment = "<li id='comment_block_"+snap.key+"' class='list-group-item'>"
      + "<h6><span class='" + snap.val().User_ID + "'></span><span style='color: grey'>:- " + new moment(snap.val().Timestamp).fromNow() + "</span>"
      +" <a href='javascript:void(0)' style='color: red' onClick='displaySubCommentSection(\""+snap.key+"\")'>Reply</a>"
      + edit_link
      + delete_link
      + "</h6>"
      + comment_text
      + "<div id='sub_"+snap.key+"' class='bg-dark text-white' style='padding: 10px; display: none;'>"
      + "<p>Insert reply below:</p>"
      + "<div style='padding-bottom: 10px'><textarea id='sub_comment_content_"+snap.key+"' class='form-control' rows='2'></textarea></div>"
      + "<div><button type='button' class='btn btn-primary btn-sm' onClick='createSubComment(\""+snap.key+"\")'>Post Reply</button> "
      + "<button type='button' class='btn btn-basic btn-sm' onClick='cancelSubCommentSection(\""+snap.key+"\")'>Cancel</button></div>"
      + "</div>"
      + "<ul id='" + snap.key + "' class='list-group'></ul>"
      + "</li>";
    $("#commentList").prepend(comment);
    firebase.database().ref("Users/" + snap.val().User_ID).once('value').then(user => {
      $("." + snap.val().User_ID).text(user.val().fullName);
    });
    loadSubComment(snap);
  });

  //On changed is somehow called twice per edit, use consol.log() and things will be printed twice
  firebase.database().ref("AnonComment/" + routeParams.AnonPost_ID).on('child_changed', snap => {
    $("#comment_text_"+snap.key).text(snap.val().Text);
  });

  firebase.database().ref("AnonComment/" + routeParams.AnonPost_ID).on('child_removed', snap => {
    $("#comment_block_"+snap.key).remove();
  });
}

function createAnonPostComment(routeParams) {
  $("#post_comment_submit").on('click', function(){
    let commentRef = firebase.database().ref("/AnonComment/");
    commentRef.once("value", function(snapshot) {
      let Post_ID = routeParams.AnonPost_ID;

      let postRef = commentRef.child(Post_ID);
      let key = postRef.push().key;
      let content = $('#post_comment_content').val();
      postRef.child(key).set({
        Text: content,
        Timestamp: firebase.database.ServerValue.TIMESTAMP,
        User_ID: firebase.auth().currentUser.uid
      });
      $('#post_comment_content').val("");
    });
  });
}