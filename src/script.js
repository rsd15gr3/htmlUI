/* Immediately when the site is refreshed this function is called */
function on_loaded_page() {
    document.getElementById("onoff_frobit_sim").checked = 'checked'; // this how to set the button checked
    to_console('Website loaded.')
}

/* Show text in self-created console in our UI */
function to_console(text) {
    var ta = document.getElementById('textarea_console');
    ta.value += "\n=> "+text;
    ta.scrollTop = ta.scrollHeight;
}

/* Publish control to the topic */
function ros_btn_msg(data_str) {
    var msg = new ROSLIB.Message({data : data_str})
    ui_str_control_topic.publish(msg);
    console.log(msg)
}

/* Manual-auto control of mobile robot changed */
function mr_man_auto_changed() {
    if (document.getElementById('mr_man_auto_switch').checked) {
        ros_btn_msg('mr_mode_auto');
    } else {
        ros_btn_msg('mr_mode_manual');
    }
}