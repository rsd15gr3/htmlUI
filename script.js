/* Immediately when the site is refreshed this function is called */
function on_loaded_page() {
    document.getElementById("onoff_frobit_sim").checked = 'checked'; // this how to set the button checked

    $('#manual_control_frame').bind('keydown', function(event) {
        switch(event.keyCode){
            case 37:
                // left arrow
                joystick._move(joystick._stickEl.style, joystick._baseX-100, joystick._baseY);
            break;

            case 38:
                // up arrow
                joystick._move(joystick._stickEl.style, joystick._baseX, joystick._baseY-100);
            break;

            case 39:
                // right arrow
                joystick._move(joystick._stickEl.style, joystick._baseX+100, joystick._baseY);
            break;

            case 40:
                // down arrow
                joystick._move(joystick._stickEl.style, joystick._baseX, joystick._baseY+100);
            break;

            case 83:
                // 's' button
                joystick._move(joystick._stickEl.style, joystick._baseX, joystick._baseY);
            break;
        }
    });
    document.getElementById('manual_control_frame').focus();

    put_joystick();
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
        set_opacity_for_man_control(0.5);
    } else {
        ros_btn_msg('mr_mode_manual');
        set_opacity_for_man_control(1.0);
    }
}

/* Manual control joystick looks disabled/enabled */
function set_opacity_for_man_control(op) {
    document.getElementById('joystick_base').style.opacity = op;
    document.getElementById('joystick_stick').style.opacity = op;
}

/* Insert joystick to the page */
function put_joystick() {
    // Design joystick's base
	base = document.getElementById("joystick_base");
	base.width = 126;
	base.height	= 126;

	var ctx = base.getContext('2d');
	ctx.beginPath();
	ctx.strokeStyle = "DarkBlue";
	ctx.lineWidth = 4;
	ctx.arc(base.width/2, base.width/2, 40, 0, Math.PI*2, true);
	ctx.fillStyle = 'DarkBlue';
    ctx.fill();
	ctx.stroke();

	ctx.beginPath();
	ctx.strokeStyle	= "DarkBlue";
	ctx.lineWidth = 2;
	ctx.arc(base.width/2, base.width/2, 60, 0, Math.PI*2, true);
	ctx.stroke();

	// Design joystick's stick
	var stick = document.getElementById("joystick_stick");
	stick.width = 86;
	stick.height = 86;
	var ctx	= stick.getContext('2d');
	ctx.beginPath();
	ctx.strokeStyle	= "DarkBlue";
	ctx.lineWidth = 4;
	ctx.arc(stick.width/2, stick.width/2, 40, 0, Math.PI*2, true);
	var grd=ctx.createRadialGradient(43,43,20,43,43,43);
    grd.addColorStop(0,"Black");
    grd.addColorStop(1,"DarkBlue");
	ctx.fillStyle = grd;
    ctx.fill();
	ctx.stroke();

    // Create the joystick
	var pos = get_absolute_position_in_page(document.getElementById("fake_joystick"))
    joystick = new VirtualJoystick({
        container: document.getElementById("joystick_container"),
        baseElement: document.getElementById("joystick_base"),
        stickElement: document.getElementById("joystick_stick"),
        mouseSupport: true,
        stationaryBase: true,
            baseX: pos.x,
            baseY: pos.y,
        limitStickTravel: true,
            stickRadius: 50
    });
}

/* Returns page coordinates of any element */
function get_absolute_position_in_page(element) {
    var rect = element.getBoundingClientRect();
    var elementLeft,elementTop;
    var scrollTop = document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop;
    var scrollLeft = document.documentElement.scrollLeft?document.documentElement.scrollLeft:document.body.scrollLeft;
    elementTop = rect.top+scrollTop;
    elementLeft = rect.left+scrollLeft;
    return {x: elementLeft, y: elementTop};
}

/* Main menu : tab changed */
function tabs_clicked() {
    if (document.getElementById("input_tab1").checked) {
        document.getElementById("joystick_container").style.display = ""
    } else {
        document.getElementById("joystick_container").style.display = "none"
    }
}

/* Change on the joystick */
function joystick_moved(x0, y0, x, y) {
    var x_rounded = Math.round(x * 100) / 100;
    var y_rounded = Math.round(y * 100) / 100;
    ros_btn_msg('mr_joystick;'+x0+";"+y0+";"+x_rounded+";"+y_rounded);
    var sw = document.getElementById('mr_man_auto_switch');
    if (sw.checked) {
        sw.checked = false;
        mr_man_auto_changed()
    }
}

/* Manual control of the mobile robot : Speed changed */
function mr_mc_speed_changed(value) {
    value==0?value="0.0":{};
    document.getElementById("mc_speed_value_span").innerHTML = value;
    ros_btn_msg('mr_speed;'+value);
}