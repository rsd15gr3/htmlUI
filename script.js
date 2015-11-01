/* Immediately when the site is refreshed this function is called */
function on_loaded_page() {

    $('#mr_manual_control_frame').bind('keydown', function(event) {
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
    document.getElementById('mr_manual_control_frame').focus();

    put_joystick();
    to_console('Website loaded.')
}

function init_ros() {
    // Get IP of Frobit Ubuntu on SDU-GUEST
    $.getJSON('http://whateverorigin.org/get?url='+encodeURIComponent('http://evee.cz/sdu/rsd/ips/ip_frobit.txt')+'&callback=?',
        function (data) {
            console.log('Frobit IP: '+data.contents);
            ip_frobit = data.contents;
            init_ros_frobit();
            document.getElementById('net_ip_frobit').innerHTML = ip_frobit;
    });

    // Get IP of Workcell Ubuntu on SDU-GUEST
    $.getJSON('http://whateverorigin.org/get?url='+encodeURIComponent('http://evee.cz/sdu/rsd/ips/ip_workcell.txt')+'&callback=?',
        function (data) {
            console.log('Workcell IP: '+data.contents);
            ip_workcell = data.contents;
            init_ros_workcell();
            document.getElementById('net_ip_workcell').innerHTML = ip_workcell;
    });
}

function init_ros_frobit() {
    // Connecting to Frobit's ROSCORE using ROSBRIDGE
    ros_frobit = new ROSLIB.Ros({
        url : 'ws://'+ip_frobit+':9090'   // You need to run ROSBRIDGE on target Ubuntu first
    });

    ros_frobit.on('connection', function() {
        document.getElementById("onoff_frobit").checked = 'checked';
        console.log('Connected to Frobit\'s ROSCORE on '+ip_frobit+'.');
        to_console('Connected to Frobit\'s ROSCORE on '+ip_frobit+'.');
    });

    ros_frobit.on('error', function(error) {
        console.log('Error connecting to Frobit\'s ROSCORE on '+ip_frobit+': ', error);
        to_console('Error connecting to Frobit\'s ROSCORE on '+ip_frobit+'.');
    });

    ros_frobit.on('close', function() {
        document.getElementById("onoff_frobit").checked = '';
        console.log('Connection to Frobit\'s ROSCORE on '+ip_frobit+' closed.');
        to_console('Connection to Frobit\'s ROSCORE on '+ip_frobit+' closed.');
    });

    // Topics on Frobit's ROSCORE
    ui_mr_str_control_topic = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/ui_str_control',
        messageType : 'std_msgs/String'
    });

    cmd_vel_topic = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/fmCommand/cmd_vel',
        messageType : 'geometry_msgs/TwistStamped'
    });

    mr_usbcam_topic = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/usb_cam/image_raw/compressed',
        messageType : 'sensor_msgs/CompressedImage'
    });

    // Mobile Robot velocities (linear and angular)
    cmd_vel_topic.subscribe(function(message) {
        document.getElementById("mr_monitor_cell_lin_vel").innerHTML = Math.round(message.twist.linear.x * 100) / 100;
        document.getElementById("mr_monitor_cell_ang_vel").innerHTML = Math.round(message.twist.angular.z * 100) / 100;
    });

    // Image from MR usbcam
    mr_usbcam_topic.subscribe(function(message) {
        document.getElementById("mr_monitor_usbcam_img").src = "data:image/png;base64,"+message.data;
    });
}

function init_ros_workcell() {
    // Connecting to Workcell's ROSCORE using ROSBRIDGE
    ros_workcell = new ROSLIB.Ros({
        url : 'ws://'+ip_workcell+':9090'   // You need to run ROSBRIDGE on target Ubuntu first
    });

    ros_workcell.on('connection', function() {
        document.getElementById("onoff_workcell").checked = 'checked';
        console.log('Connected to Workcell\'s ROSCORE on '+ip_workcell+'.');
        to_console('Connected to Workcell\'s ROSCORE on '+ip_workcell+'.');
    });

    ros_workcell.on('error', function(error) {
        console.log('Error connecting to Workcell\'s ROSCORE on '+ip_workcell+': ', error);
        to_console('Error connecting to Workcell\'s ROSCORE on '+ip_workcell+'.');
    });

    ros_workcell.on('close', function() {
        document.getElementById("onoff_workcell").checked = '';
        console.log('Connection to Workcell\'s ROSCORE on '+ip_workcell+' closed.');
        to_console('Connection to Workcell\'s ROSCORE on '+ip_workcell+' closed.');
    });

    wc_usbcam_topic = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/usb_cam/image_raw/compressed',
        messageType : 'sensor_msgs/CompressedImage'
    });

    // Image from WC usbcam
    wc_usbcam_topic.subscribe(function(message) {
        document.getElementById("wc_monitor_usbcam_img").src = "data:image/png;base64,"+message.data;
    });
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
    ui_mr_str_control_topic.publish(msg);
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
    if (document.getElementById("input_tab2").checked) {
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