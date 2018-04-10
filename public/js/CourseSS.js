function getCourse(){
	let course = firebase.database().ref().child("Courses");
	course.on("child_added", snap => {
		let course = snap.val().Name;
		var semester = snap.val().Semester;
		var year = snap.child.Year;

		$("#Courses").append("<a href='#!/course/"+snap.key+"' class='list-group-item'>" + course + ": " + semester + " " + year + "</a>");
	});
}
