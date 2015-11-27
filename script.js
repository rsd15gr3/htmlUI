
/* This function is called every time the site is refreshed */
function on_loaded_page() {
    /* Init all components on the web page first */
    init_manual_control_for_frobit();
    init_manual_control_for_workcell();

    /* Init connections to ROS cores */
    init_ros();

    /* Run monitoring loop functions */
    setInterval(update_ros_structure, 1000);    // Update ROS Structure Monitor every 1 s

    /* Inform user about loading the page */
    to_console('Website loaded.')
}

/* ---------------------------- ROS ------------------------------------ */
/* Get ROScores IPs and initialize ROS here in js */
function init_ros() {
    // Get IP of Frobit Ubuntu on SDU-GUEST
    $.getJSON('http://whateverorigin.org/get?url='+encodeURIComponent('http://evee.cz/sdu/rsd/ips/ip_frobit.txt')+'&callback=?',
        function (data) {
            console.log('Frobit IP: '+data.contents);
            ip_frobit = data.contents;
            init_ros_frobit();
            document.getElementById('mr_monitor_ip').innerHTML = ip_frobit;
            document.getElementById('tipper_monitor_ip').innerHTML = ip_frobit;
    });

    // Get IP of Workcell Ubuntu on SDU-GUEST
    $.getJSON('http://whateverorigin.org/get?url='+encodeURIComponent('http://evee.cz/sdu/rsd/ips/ip_workcell.txt')+'&callback=?',
        function (data) {
            console.log('Workcell IP: '+data.contents);
            ip_workcell = data.contents;
            init_ros_workcell();
            document.getElementById('wc_monitor_ip').innerHTML = ip_workcell;
            document.getElementById('belt_monitor_ip').innerHTML = ip_workcell;
    });
}

/* Make a connection to Frobit's ROScore and init topics */
function init_ros_frobit() {
    // Connecting to Frobit's ROSCORE using ROSBRIDGE
    ros_frobit = new ROSLIB.Ros({
        //url : 'ws://localhost:9090'   // For testing on my computer
        url : 'ws://10.125.7.186:9090'
        //url : 'ws://'+ip_frobit+':9090'   // You need to run ROSBRIDGE on target Ubuntu first
    });

    ros_frobit.on('connection', function() {
        frobit_connected();
    });

    ros_frobit.on('error', function(error) {
        console.log('Error connecting to Frobit\'s ROSCORE on '+ip_frobit+': ', error);
        to_console('Error connecting to Frobit\'s ROSCORE on '+ip_frobit+'.');
    });

    ros_frobit.on('close', function() {
        frobit_disconnected();
    });

    // Topics on Frobit's ROSCORE
    ui_mr_str_control_topic = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/ui/str_control_frobit',
        messageType : 'std_msgs/String'
    });

    cmd_vel_topic = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/fmCommand/cmd_vel',
        messageType : 'geometry_msgs/TwistStamped'
    });

    control_mode_frobit_topic = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/fmPlan/automode',
        messageType : 'msgs/IntStamped'
    });

    ui_mes_frobit_topic = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/ui/mes',
        messageType : 'msgs/IntStamped'
    });

    frobit_next_mission_topic = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/mission/next_mission',
        messageType : 'std_msgs/String'
    });

    tipper_automode_topic = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/ui/tipper_automode',
        messageType : 'msgs/BoolStamped'
    });

    tipper_position_topic = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/ui/tipper_position',
        messageType : 'msgs/IntStamped'
    });

    mr_usbcam_topic = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/usb_cam/image_raw/compressed',
        messageType : 'sensor_msgs/CompressedImage'
    });

    // Mobile Robot velocities (linear and angular)
    cmd_vel_topic.subscribe(function(message) {
        mr_control_enabled();
        document.getElementById("mr_monitor_linvel").innerHTML = Math.round(message.twist.linear.x * 100) / 100;
        document.getElementById("mr_monitor_angvel").innerHTML = Math.round(message.twist.angular.z * 100) / 100;
    });

    // Mobile Robot control mode
    control_mode_frobit_topic.subscribe(function(message) {
        mr_control_enabled();
        if (message.data == 1) {
            mr_automode_is_true();
        } else if (message.data == 0) {
            mr_automode_is_false();
        }
    });

    // Mobile Robot next mission subscription
    frobit_next_mission_topic.subscribe(function(message) {
        document.getElementById("mes_mr_next_mission_div").innerHTML = 'Next mission: '+message.data;
        document.getElementById("mr_monitor_mission").innerHTML = message.data;
    });

    // Tipper automode state subscription
    tipper_automode_topic.subscribe(function(message) {
        tipper_control_enabled();
        if (message.data == true) {
            tipper_automode_is_true();
        } else if (message.data == false) {
            tipper_automode_is_false();
        }
    });

    // Tipper position subscription
    tipper_position_topic.subscribe(function(message) {
        document.getElementById("tipper_monitor_position").innerHTML = message.data;
        document.getElementById("tipper_slider").value = parseInt(message.data);
    });

    // Image from MR usbcam
    mr_usbcam_topic.subscribe(function(message) {
        document.getElementById("cam_mr_img").src = "data:image/png;base64,"+message.data;
    });

    // Monitoring ROS structure
    topics_client_frobit_service = new ROSLIB.Service({
        ros : ros_frobit,
        name : '/rosapi/topics',
        serviceType : 'rosapi/Topics'
    });

    nodes_client_frobit_service = new ROSLIB.Service({
        ros : ros_frobit,
        name : '/rosapi/nodes',
        serviceType : 'rosapi/Nodes'
    });

    services_client_frobit_service = new ROSLIB.Service({
        ros : ros_frobit,
        name : '/rosapi/services',
        serviceType : 'rosapi/Services'
    });
}

/* Make a connection to Workcell's ROScore and init topics */
function init_ros_workcell() {
    // Connecting to Workcell's ROSCORE using ROSBRIDGE
    ros_workcell = new ROSLIB.Ros({
        //url : 'ws://localhost:9090'   // For testing on my computer
        url : 'ws://10.125.7.186:9090'
        //url : 'ws://'+ip_workcell+':9090'   // You need to run ROSBRIDGE on target Ubuntu first
    });

    ros_workcell.on('connection', function() {
        workcell_connected();
    });

    ros_workcell.on('error', function(error) {
        console.log('Error connecting to Workcell\'s ROSCORE on '+ip_workcell+': ', error);
        to_console('Error connecting to Workcell\'s ROSCORE on '+ip_workcell+'.');
    });

    ros_workcell.on('close', function() {
        workcell_disconnected();
    });

    // Topics on Workcell's CORE
    ui_wc_str_control_topic = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/ui/str_control_workcell',
        messageType : 'std_msgs/String'
    });

    wc_usbcam_topic = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/usb_cam/image_raw/compressed',
        messageType : 'sensor_msgs/CompressedImage'
    });

    // Image from WC usbcam
    wc_usbcam_topic.subscribe(function(message) {
        document.getElementById("cam_wc_img").src = "data:image/png;base64,"+message.data;
    });

    // Monitoring ROS structure
    topics_client_workcell_service = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/rosapi/topics',
        serviceType : 'rosapi/Topics'
    });

    nodes_client_workcell_service = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/rosapi/nodes',
        serviceType : 'rosapi/Nodes'
    });

    services_client_workcell_service = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/rosapi/services',
        serviceType : 'rosapi/Services'
    });

    getconf_client_workcell_service = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/KukaNode/GetConfiguration',
        serviceType: 'kuka_ros/getConfiguration'
    });

    setInterval(update_kuka_configuration, 50); // Update Kuka configuration every 50 ms
}

/* This function is being run in a loop, it updates Kuka's configuration */
function update_kuka_configuration() {
    try {
        getconf_client_workcell_service.callService(new ROSLIB.ServiceRequest(), function(result) {
            console.log(result.q[0]);
            set_kuka_configuration(result.q);
        });
    } catch (err) {
        console.log(err.message);
    }
}

/* This function is being run in a loop, it monitors ROS structures */
function update_ros_structure() {
    try {
        topics_client_frobit_service.callService(new ROSLIB.ServiceRequest(), function(result) {
            var topics_frobit_str = '';
            for (var i in result.topics) {
              topics_frobit_str += result.topics[i]+'<br />';
            }
            document.getElementById('ros_mr_topics').innerHTML = topics_frobit_str;
        });
        nodes_client_frobit_service.callService(new ROSLIB.ServiceRequest(), function(result) {
            var nodes_frobit_str = '';
            for (var i in result.nodes) {
              nodes_frobit_str += result.nodes[i]+'<br />';
            }
            document.getElementById('ros_mr_nodes').innerHTML = nodes_frobit_str;
        });
        services_client_frobit_service.callService(new ROSLIB.ServiceRequest(), function(result) {
            var services_frobit_str = '';
            for (var i in result.services) {
              services_frobit_str += result.services[i]+'<br />';
            }
            document.getElementById('ros_mr_services').innerHTML = services_frobit_str;
        });
    } catch (err) {
        console.log(err.message);
    }

    try {
        topics_client_workcell_service.callService(new ROSLIB.ServiceRequest(), function(result) {
            var topics_workcell_str = '';
            for (var i in result.topics) {
              topics_workcell_str += result.topics[i]+'<br />';
            }
            document.getElementById('ros_wc_topics').innerHTML = topics_workcell_str;
        });
        nodes_client_workcell_service.callService(new ROSLIB.ServiceRequest(), function(result) {
            var nodes_workcell_str = '';
            for (var i in result.nodes) {
              nodes_workcell_str += result.nodes[i]+'<br />';
            }
            document.getElementById('ros_wc_nodes').innerHTML = nodes_workcell_str;
        });
        services_client_workcell_service.callService(new ROSLIB.ServiceRequest(), function(result) {
            var services_workcell_str = '';
            for (var i in result.services) {
              services_workcell_str += result.services[i]+'<br />';
            }
            document.getElementById('ros_wc_services').innerHTML = services_workcell_str;
        });
    } catch (err) {
        console.log(err.message);
    }
};

/* Sets KUKA configuration after reading it */
function set_kuka_configuration(q) {
    // Sliders
    document.getElementById('wc_mc_slider_j0').value = parseFloat(q[0]);
    document.getElementById('wc_mc_slider_j1').value = parseFloat(q[1]);
    document.getElementById('wc_mc_slider_j2').value = parseFloat(q[2]);
    document.getElementById('wc_mc_slider_j3').value = parseFloat(q[3]);
    document.getElementById('wc_mc_slider_j4').value = parseFloat(q[4]);
    document.getElementById('wc_mc_slider_j5').value = parseFloat(q[5]);

    // Monitor cells
    document.getElementById('wc_monitor_j0').innerHTML = q[0];
    document.getElementById('wc_monitor_j1').innerHTML = q[1];
    document.getElementById('wc_monitor_j2').innerHTML = q[2];
    document.getElementById('wc_monitor_j3').innerHTML = q[3];
    document.getElementById('wc_monitor_j4').innerHTML = q[4];
    document.getElementById('wc_monitor_j5').innerHTML = q[5];
}

/* Show text in self-created console in our UI */
function to_console(text) {
    var ta = document.getElementById('textarea_console');
    ta.value += "\n=> "+text;
    ta.scrollTop = ta.scrollHeight;
}

/* Publish control for Frobit */
function ros_msg_frobit(data_str) {
    var msg = new ROSLIB.Message({data : data_str});
    ui_mr_str_control_topic.publish(msg);
    console.log(msg);
    to_console('To Frobit: '+msg.data);
}

/* Publish control for Workcell */
function ros_msg_workcell(data_str) {
    var msg = new ROSLIB.Message({data : data_str});
    ui_wc_str_control_topic.publish(msg);
    console.log(msg);
    to_console('To Workcell: '+msg.data);
}

/* ---------------------------- FROBIT ------------------------------------ */

function frobit_connected() {
    document.getElementById("onoff_frobit").checked = 'checked';
    document.getElementById("mr_monitor_ip").style.backgroundColor = 'LightGreen';
    document.getElementById("tipper_monitor_ip").style.backgroundColor = 'LightGreen';
    console.log('Connected to Frobit\'s ROSCORE on '+ip_frobit+'.');
    to_console('Connected to Frobit\'s ROSCORE on '+ip_frobit+'.');
}

function frobit_disconnected() {
    // Frobit info reactions
    mr_control_disabled();
    document.getElementById("mr_monitor_mode").innerHTML = "&nbsp;";
    document.getElementById("mr_monitor_mission").innerHTML = "&nbsp;";
    document.getElementById("mr_monitor_position").innerHTML = "&nbsp;";
    document.getElementById("mr_monitor_linvel").innerHTML = "&nbsp;";
    document.getElementById("mr_monitor_angvel").innerHTML = "&nbsp;";

    // Tipper info reactions
    tipper_control_disabled();
    document.getElementById("tipper_monitor_mode").innerHTML = "&nbsp;";
    document.getElementById("tipper_monitor_position").innerHTML = "&nbsp;";

    document.getElementById("onoff_frobit").checked = '';
    document.getElementById("mr_monitor_ip").style.backgroundColor = 'Red';
    document.getElementById("tipper_monitor_ip").style.backgroundColor = 'Red';
    console.log('Connection to Frobit\'s ROSCORE on '+ip_frobit+' closed.');
    to_console('Connection to Frobit\'s ROSCORE on '+ip_frobit+' closed.');
}

function mr_control_enabled() {
    document.getElementById("mr_manual_control_frame").style.opacity = 1.0;
    document.getElementById("mr_man_auto_switch").disabled = '';
    document.getElementById("img_safety_button_frobit").style.cursor = "pointer";
    document.getElementById("joystick_container").style.visibility = "visible";
}

function mr_control_disabled() {
    document.getElementById("mr_manual_control_frame").style.opacity = 0.5;
    document.getElementById("mr_man_auto_switch").disabled = 'disabled';
    document.getElementById("joystick_container").style.visibility = "hidden";
    document.getElementById("img_safety_button_frobit").src = "img/cant_read_frobit.png";
    document.getElementById("img_safety_button_frobit").onclick = ""
    document.getElementById("img_safety_button_frobit").style.cursor = "wait";
}

/* Initialize joystick for frobit's manual control */
function init_manual_control_for_frobit() {
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
}

/* Insert joystick to the page */
function put_joystick() {
    // Design joystick's base
    base = document.getElementById("joystick_base");
    base.width = 126;
    base.height = 126;

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
    var ctx = stick.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle	= "DarkBlue";
    ctx.lineWidth = 4;
    ctx.arc(stick.width/2, stick.width/2, 40, 0, Math.PI*2, true);
    var grd = ctx.createRadialGradient(43, 43, 20, 43, 43, 43);
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

/* Main menu : tab changed : used for joystick to be shown or not */
function tabs_clicked() {
    if (document.getElementById("input_tab1").checked) {
        document.getElementById("joystick_container").style.display = ""
    } else {
        document.getElementById("joystick_container").style.display = "none"
    }
}

/* Change on the joystick */
function joystick_moved(x0, y0, x, y) {
    mr_make_automode_false();
    var x_rounded = Math.round(x * 100) / 100;
    var y_rounded = Math.round(y * 100) / 100;
    ros_msg_frobit('mr_joystick_'+x0+";"+y0+";"+x_rounded+";"+y_rounded);
}

/* Frobit automode topic subscribed and evaluated as True */
function mr_automode_is_true() {
    document.getElementById("mr_monitor_mode").innerHTML = 'Automode';
    document.getElementById("img_safety_button_frobit").src = "img/stop_frobit.png";
    document.getElementById("img_safety_button_frobit").onclick = mr_make_automode_false;
    mr_set_opacity_for_man_control(0.5);
    document.getElementById('mr_man_auto_switch').checked = true;
}

/* Frobit automode topic subscribed and evaluated as False */
function mr_automode_is_false() {
    document.getElementById("mr_monitor_mode").innerHTML = 'Manual control';
    document.getElementById("img_safety_button_frobit").src = "img/run_frobit_auto.png";
    document.getElementById("img_safety_button_frobit").onclick = mr_make_automode_true;
    mr_set_opacity_for_man_control(1.0);
    document.getElementById('mr_man_auto_switch').checked = false;
}

/* Change Frobit's mode to be Automode */
function mr_make_automode_true() {
    ros_msg_frobit('mr_mode_auto');
}

/* Change Frobit's mode to be Manual */
function mr_make_automode_false() {
    ros_msg_frobit('mr_mode_manual');
}

/* Manual-auto control of mobile robot changed */
function mr_man_auto_changed() {
    if (document.getElementById('mr_man_auto_switch').checked) {
        mr_make_automode_true();
    } else {
        mr_make_automode_false();
    }
}

/* Manual control joystick looks disabled/enabled */
function mr_set_opacity_for_man_control(op) {
    document.getElementById('joystick_base').style.opacity = op;
    document.getElementById('joystick_stick').style.opacity = op;
}

/* ---------------------------- WORKCELL ------------------------------------ */

function workcell_connected() {
    document.getElementById("onoff_workcell").checked = 'checked';
    document.getElementById("wc_monitor_ip").style.backgroundColor = 'LightGreen';
    document.getElementById("belt_monitor_ip").style.backgroundColor = 'LightGreen';
    console.log('Connected to Workcell\'s ROSCORE on '+ip_workcell+'.');
    to_console('Connected to Workcell\'s ROSCORE on '+ip_workcell+'.');
}

function workcell_disconnected() {
    // Workcell's reactions
    document.getElementById("img_safety_button_workcell").src = "img/cant_read_workcell.png";
    document.getElementById("img_safety_button_workcell").onclick = ""
    document.getElementById("img_safety_button_workcell").style.cursor = "wait";
    document.getElementById("wc_monitor_mode").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_mission").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j0").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j1").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j2").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j3").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j4").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j5").innerHTML = "&nbsp;";


    // Belt's reactions
    document.getElementById("img_safety_button_belt").src = "img/cant_read_belt.png";
    document.getElementById("img_safety_button_belt").onclick = ""
    document.getElementById("img_safety_button_belt").style.cursor = "wait";
    document.getElementById("belt_monitor_mode").innerHTML = "&nbsp;";
    document.getElementById("belt_monitor_status").innerHTML = "&nbsp;";
    document.getElementById("belt_monitor_direction").innerHTML = "&nbsp;";
    document.getElementById("belt_monitor_velocity").innerHTML = "&nbsp;";

    // General reactions
    document.getElementById("onoff_workcell").checked = '';
    document.getElementById("wc_monitor_ip").style.backgroundColor = 'Red';
    document.getElementById("belt_monitor_ip").style.backgroundColor = 'Red';
    console.log('Connection to Workcell\'s ROSCORE on '+ip_workcell+' closed.');
    to_console('Connection to Workcell\'s ROSCORE on '+ip_workcell+' closed.');
}

/* Set workcell parameters to the control system */
function init_manual_control_for_workcell() {
    /* set boundaries and step for each joint */
    
    // j0
    document.getElementById('wc_mc_slider_j0').min = parseFloat(wc_mc_j0_min);
    document.getElementById('wc_mc_slider_j0').max = parseFloat(wc_mc_j0_max);
    document.getElementById('wc_mc_slider_j0').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_j0').value = parseFloat(wc_mc_j0_init);
    document.getElementById('wc_mc_min_j0').innerHTML = parseFloat(wc_mc_j0_min);
    document.getElementById('wc_mc_max_j0').innerHTML = parseFloat(wc_mc_j0_max);
    
    // j1
    document.getElementById('wc_mc_slider_j1').min = parseFloat(wc_mc_j1_min);
    document.getElementById('wc_mc_slider_j1').max = parseFloat(wc_mc_j1_max);
    document.getElementById('wc_mc_slider_j1').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_j1').value = parseFloat(wc_mc_j1_init);
    document.getElementById('wc_mc_min_j1').innerHTML = parseFloat(wc_mc_j1_min);
    document.getElementById('wc_mc_max_j1').innerHTML = parseFloat(wc_mc_j1_max);
    
    // j2
    document.getElementById('wc_mc_slider_j2').min = parseFloat(wc_mc_j2_min);
    document.getElementById('wc_mc_slider_j2').max = parseFloat(wc_mc_j2_max);
    document.getElementById('wc_mc_slider_j2').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_j2').value = parseFloat(wc_mc_j2_init);
    document.getElementById('wc_mc_min_j2').innerHTML = parseFloat(wc_mc_j2_min);
    document.getElementById('wc_mc_max_j2').innerHTML = parseFloat(wc_mc_j2_max);
    
    // j3
    document.getElementById('wc_mc_slider_j3').min = parseFloat(wc_mc_j3_min);
    document.getElementById('wc_mc_slider_j3').max = parseFloat(wc_mc_j3_max);
    document.getElementById('wc_mc_slider_j3').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_j3').value = parseFloat(wc_mc_j3_init);
    document.getElementById('wc_mc_min_j3').innerHTML = parseFloat(wc_mc_j3_min);
    document.getElementById('wc_mc_max_j3').innerHTML = parseFloat(wc_mc_j3_max);
    
    // j4
    document.getElementById('wc_mc_slider_j4').min = parseFloat(wc_mc_j4_min);
    document.getElementById('wc_mc_slider_j4').max = parseFloat(wc_mc_j4_max);
    document.getElementById('wc_mc_slider_j4').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_j4').value = parseFloat(wc_mc_j4_init);
    document.getElementById('wc_mc_min_j4').innerHTML = parseFloat(wc_mc_j4_min);
    document.getElementById('wc_mc_max_j4').innerHTML = parseFloat(wc_mc_j4_max);
    
    // j5
    document.getElementById('wc_mc_slider_j5').min = parseFloat(wc_mc_j5_min);
    document.getElementById('wc_mc_slider_j5').max = parseFloat(wc_mc_j5_max);
    document.getElementById('wc_mc_slider_j5').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_j5').value = parseFloat(wc_mc_j5_init);
    document.getElementById('wc_mc_min_j5').innerHTML = parseFloat(wc_mc_j5_min);
    document.getElementById('wc_mc_max_j5').innerHTML = parseFloat(wc_mc_j5_max);
    
    // Gripper
    document.getElementById('wc_mc_slider_g').min = parseFloat(wc_mc_g_min);
    document.getElementById('wc_mc_slider_g').max = parseFloat(wc_mc_g_max);
    document.getElementById('wc_mc_slider_g').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_g').value = parseFloat(wc_mc_g_init);
    document.getElementById('wc_mc_min_g').innerHTML = parseFloat(wc_mc_g_min);
    document.getElementById('wc_mc_max_g').innerHTML = parseFloat(wc_mc_g_max);
}

/* Manual-auto control of workcell changed */
function wc_man_auto_changed() {
    if (document.getElementById('wc_man_auto_switch').checked) {
        ros_msg_workcell('wc_mode_auto');
        document.getElementById('wc_mc_table').style.opacity = 0.5;
    } else {
        ros_msg_workcell('wc_mode_manual');
        document.getElementById('wc_mc_table').style.opacity = 1.0;
    }
}

function wc_man_control_clicked() {
    // Manual-auto control change?
    var sw = document.getElementById('wc_man_auto_switch');
    if (sw.checked) {
        sw.checked = false;
        ros_msg_workcell('wc_mode_manual');
        document.getElementById('wc_mc_table').style.opacity = 1.0;
    }
}

/* Manual control for workcell : configuration changed down */
function wc_mc_joint_down(joint_id) {
    wc_man_control_clicked();
    var slider = document.getElementById('wc_mc_slider_'+joint_id);
    var new_val = parseFloat(slider.value)-parseFloat(wc_mc_joint_step);
    if (parseFloat(new_val) >= parseFloat(slider.min)) {
        slider.value = new_val;
        ros_msg_workcell('wc_joint_'+joint_id+'_d');
        to_console('WC: Joint '+joint_id+' set to '+new_val);
    }
}

/* Manual control for workcell : configuration changed up */
function wc_mc_joint_up(joint_id) {
    wc_man_control_clicked();
    var slider = document.getElementById('wc_mc_slider_'+joint_id);
    var new_val = parseFloat(slider.value)+parseFloat(wc_mc_joint_step);
    if (parseFloat(new_val) <= parseFloat(slider.max)) {
        slider.value = new_val;
        ros_msg_workcell('wc_joint_'+joint_id+'_u');
        to_console('WC: Joint '+joint_id+' set to '+new_val);
    }
}

function wc_stop_clicked() {
    wc_man_control_clicked();
    ros_msg_workcell('wc_stop');
}

/* ---------------------------- TIPPER ------------------------------------ */

function tipper_control_enabled() {
    document.getElementById("tipper_manual_control_frame").style.opacity = 1.0;
    document.getElementById("tipper_man_auto_switch").disabled = '';
    document.getElementsByClassName("tipper_button")[0].disabled = '';
    document.getElementsByClassName("tipper_button")[1].disabled = '';
    document.getElementById("img_safety_button_tipper").style.cursor = "pointer";
}

function tipper_control_disabled() {
    document.getElementById("tipper_manual_control_frame").style.opacity = 0.5;
    document.getElementById("tipper_man_auto_switch").disabled = 'disabled';
    document.getElementsByClassName("tipper_button")[0].disabled = 'disabled';
    document.getElementsByClassName("tipper_button")[1].disabled = 'disabled';
    document.getElementById("img_safety_button_tipper").src = "img/cant_read_frobit.png";
    document.getElementById("img_safety_button_tipper").onclick = ""
    document.getElementById("img_safety_button_tipper").style.cursor = "wait";
}

function tipper_automode_is_true() {
    document.getElementById("tipper_monitor_mode").innerHTML = 'Automode';
    document.getElementById("img_safety_button_tipper").src = "img/stop_tipper.png";
    document.getElementById("img_safety_button_tipper").onclick = tipper_make_automode_false;
    document.getElementById('tipper_man_auto_switch').checked = true;
    document.getElementById('tipper_manual_frame').style.opacity = 0.5;
}

function tipper_automode_is_false() {
    document.getElementById("tipper_monitor_mode").innerHTML = 'Manual control';
    document.getElementById("img_safety_button_tipper").src = "img/run_tipper_auto.png";
    document.getElementById("img_safety_button_tipper").onclick = tipper_make_automode_true;
    document.getElementById('tipper_man_auto_switch').checked = false;
    document.getElementById('tipper_manual_frame').style.opacity = 1.0;
}

function tipper_make_automode_true() {
    ros_msg_frobit('tipper_mode_auto');
}

function tipper_make_automode_false() {
    ros_msg_frobit('tipper_mode_manual');
}

/* Manual-auto control of tipper changed */
function tipper_man_auto_changed() {
    if (document.getElementById('tipper_man_auto_switch').checked) {
        tipper_make_automode_true();
    } else {
        tipper_make_automode_false();
    }
}

function tipper_up() {
    ros_msg_frobit('tipper_move_up');
}

function tipper_down() {
    ros_msg_frobit('tipper_move_down');
}

/* ---------------------------- BELT ------------------------------------ */
/* Belt automode topic subscribed and evaluated as True */
function belt_automode_is_true() {
    document.getElementById("belt_monitor_mode").innerHTML = 'Automode';
    document.getElementById("img_safety_button_belt").src = "img/stop_belt.png";
    document.getElementById("img_safety_button_belt").onclick = belt_stop;
    document.getElementById('belt_man_auto_switch').checked = true;
    document.getElementsByClassName('beltonoffswitch')[0].style.opacity = 0.5;
    document.getElementsByClassName('beltdirectionswitch')[0].style.opacity = 0.5;
    document.getElementsByClassName('beltspeedswitch')[0].style.opacity = 0.5;
}

/* Belt automode topic subscribed and evaluated as False */
function belt_automode_is_false() {
    document.getElementById("belt_monitor_mode").innerHTML = 'Manual control';
    document.getElementById("img_safety_button_belt").src = "img/run_belt_auto.png";
    document.getElementById("img_safety_button_belt").onclick = belt_make_automode_true;
    document.getElementById('belt_man_auto_switch').checked = false;
    document.getElementsByClassName('beltonoffswitch')[0].style.opacity = 1.0;
    document.getElementsByClassName('beltdirectionswitch')[0].style.opacity = 1.0;
    document.getElementsByClassName('beltspeedswitch')[0].style.opacity = 1.0;
}

/* Change Belt's mode to be Automode */
function belt_make_automode_true() {
    ros_msg_workcell('belt_mode_auto');
}

/* Change Belt's mode to be Manual */
function belt_make_automode_false() {
    ros_msg_workcell('belt_mode_manual');
}

/* Manual-auto control of belt changed */
function belt_man_auto_changed() {
    if (document.getElementById('belt_man_auto_switch').checked) {
        belt_make_automode_true();
    } else {
        belt_make_automode_false();
    }
}

function belt_call_srv() {
    var str_control = 'belt_srv';
    if (document.getElementById('belt_on_off_switch').checked) {
        srv_control += '_on';
    } else {
        srv_control += '_off'
    }

    if (document.getElementById('belt_direction_switch').checked) {
        srv_control += '_forward';
    } else {
        srv_control += '_backwards'
    }

    if (document.getElementById('belt_speed_switch').checked) {
        srv_control += '_slow';
    } else {
        srv_control += '_fast'
    }
}

/* Belt switched on/off */
function belt_on_off_changed() {
    belt_make_automode_false();
    belt_call_srv();
}

/* Belt switched on/off */
function belt_direction_or_speed_changed() {
    belt_make_automode_false();
    if (document.getElementById('belt_on_off_switch').checked) {
        belt_call_srv();
    }
}

function belt_stop() {
    belt_make_automode_false(); // might be not necessarry
    document.getElementById('belt_on_off_switch').checked = '';
    belt_call_srv();    // might not be necessarry
}

/* ---------------------------- MES-sim ------------------------------------ */
function on_mes_frobit_change(value) {
    var msg = new ROSLIB.Message({data : value});
    ui_mes_frobit_topic.publish(msg);
}