
/* Make a connection to Workcell's ROScore and init topics */
function wc_init_ros() {

    // Get IP of Workcell Ubuntu on SDU-GUEST
    $.getJSON('http://whateverorigin.org/get?url='+encodeURIComponent('http://evee.cz/sdu/rsd/ips/ip_workcell.txt')+'&callback=?',
        function (data) {
            ip_workcell = data.contents;      // Connect HMI to Workcel PC
            //ip_workcell = '10.125.7.186';       // Test HMI on your computer (put your IP)
            wc_got_ip();
            wc_connect_roscore();
    });
}

function wc_connect_roscore() {
    // Connecting to Workcell's ROSCORE using ROSBRIDGE
    ros_workcell = new ROSLIB.Ros({
        url : 'ws://'+ip_workcell+':9090'
    });

    ros_workcell.on('connection', function() {
        wc_ros_connected();
    });

    ros_workcell.on('error', function(error) {
        console.log('Error connecting to Workcell\'s ROSCORE on '+ip_workcell+': ', error);
        to_console('Error connecting to Workcell\'s ROSCORE on '+ip_workcell+'.');
    });

    ros_workcell.on('close', function() {
        wc_ros_disconnected();
    });

    // Topics on Workcell's CORE
    wc_tp_ui_str_control = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/ui/str_control_workcell',
        messageType : 'std_msgs/String'
    });

    wc_tp_automode = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/ui/wc_automode',
        messageType : 'msgs/BoolStamped'
    });

    wc_tp_usbcam = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/usb_cam/image_raw/compressed',
        messageType : 'sensor_msgs/CompressedImage'
    });

    belt_tp_automode = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/ui/belt_automode',
        messageType : 'msgs/BoolStamped'
    });

    // Workcell control mode
    wc_tp_automode.subscribe(function(message) {
        wc_got_mode(message);
    });

    // Image from WC usbcam
    wc_tp_usbcam.subscribe(function(message) {
        document.getElementById("cam_wc_img").src = "data:image/png;base64,"+message.data;
    });

    // Belt control mode
    belt_tp_automode.subscribe(function(message) {
        belt_got_mode(message);
    });

    // Services on WC core
    wc_srv_getconf = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/KukaNode/GetConfiguration',
        serviceType: 'kuka_ros/getConfiguration'
    });

    wc_srv_topics = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/rosapi/topics',
        serviceType : 'rosapi/Topics'
    });

    wc_srv_nodes = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/rosapi/nodes',
        serviceType : 'rosapi/Nodes'
    });

    wc_srv_services = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/rosapi/services',
        serviceType : 'rosapi/Services'
    });

    // Monitor Workcell's ROS structure, [ms]
    wc_monitor_interval = setInterval(wc_update_ros_structure, 1000);

    // Update Kuka configuration every 50 ms
    wc_kuka_conf_interval = setInterval(wc_update_kuka_conf, 50);
}

function wc_got_ip() {
    document.getElementById('wc_monitor_ip').innerHTML = ip_workcell;
    document.getElementById('belt_monitor_ip').innerHTML = ip_workcell;
    console.log('Workcell IP: '+ip_workcell);
}

function wc_ros_connected() {
    // Connected Indication
    document.getElementById("onoff_workcell").checked = 'checked';
    document.getElementById("wc_monitor_ip").style.backgroundColor = 'LightGreen';
    document.getElementById("belt_monitor_ip").style.backgroundColor = 'LightGreen';

    // Enable control of Kuka
    document.getElementById("wc_manual_control_frame").style.opacity = 1.0;
    document.getElementById("img_safety_button_wc").style.cursor = "pointer";
    document.getElementById("wc_man_auto_switch").disabled = '';
    var btns = document.getElementsByClassName("wc_mc_table_button");
    for(var i = 0; i < btns.length; i++) {
       btns.item(i).disabled = '';
    }

    // Enable control of Belt
    document.getElementById("belt_manual_control_frame").style.opacity = 1.0;
    document.getElementById("img_safety_button_belt").style.cursor = "pointer";
    document.getElementById("belt_man_auto_switch").disabled = '';
    document.getElementById("belt_on_off_switch").disabled = '';
    document.getElementById("belt_direction_switch").disabled = '';
    document.getElementById("belt_speed_switch").disabled = '';

    // Console Info
    console.log('Connected to Workcell\'s ROSCORE on '+ip_workcell+'.');
    to_console('Connected to Workcell\'s ROSCORE on '+ip_workcell+'.');
}

function wc_ros_disconnected() {
    // Workcell Monitoring
    document.getElementById("wc_monitor_mode").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_mission").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j0").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j1").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j2").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j3").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j4").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j5").innerHTML = "&nbsp;";

    // Workcell Control Options
    document.getElementById("wc_manual_control_frame").style.opacity = 0.5;
    document.getElementById("img_safety_button_wc").src = "img/cant_read_workcell.png";
    document.getElementById("img_safety_button_wc").onclick = ""
    document.getElementById("img_safety_button_wc").style.cursor = "wait";
    document.getElementById("wc_man_auto_switch").disabled = 'disabled';
    var btns = document.getElementsByClassName("wc_mc_table_button");
    for(var i = 0; i < btns.length; i++) {
       btns.item(i).disabled = 'disabled';
    }

    // Belt Monitoring
    document.getElementById("belt_monitor_mode").innerHTML = "&nbsp;";
    document.getElementById("belt_monitor_status").innerHTML = "&nbsp;";
    document.getElementById("belt_monitor_direction").innerHTML = "&nbsp;";
    document.getElementById("belt_monitor_velocity").innerHTML = "&nbsp;";

    // Belt Control Options
    document.getElementById("belt_manual_control_frame").style.opacity = 0.5;
    document.getElementById("img_safety_button_belt").src = "img/cant_read_belt.png";
    document.getElementById("img_safety_button_belt").onclick = ""
    document.getElementById("img_safety_button_belt").style.cursor = "wait";
    document.getElementById("belt_man_auto_switch").disabled = 'disabled';
    document.getElementById("belt_on_off_switch").disabled = 'disabled';
    document.getElementById("belt_direction_switch").disabled = 'disabled';
    document.getElementById("belt_speed_switch").disabled = 'disabled';

    // Disconnected Indication
    document.getElementById("onoff_workcell").checked = '';
    document.getElementById("wc_monitor_ip").style.backgroundColor = 'Red';
    document.getElementById("belt_monitor_ip").style.backgroundColor = 'Red';

    // Stop Intervals
    clearInterval(wc_monitor_interval);
    clearInterval(wc_kuka_conf_interval);

    // Console Info
    console.log('Connection to Workcell\'s ROSCORE on '+ip_workcell+' closed.');
    to_console('Connection to Workcell\'s ROSCORE on '+ip_workcell+' closed.');
}

/* Publish control for Workcell */
function wc_ros_msg(data_str) {
    var msg = new ROSLIB.Message({data : data_str});
    wc_tp_ui_str_control.publish(msg);
    console.log(msg);
    to_console('To Workcell: '+msg.data);
}

/* This function is being run in a loop, it updates Kuka's configuration */
function wc_update_kuka_conf() {
    try {
        wc_srv_getconf.callService(new ROSLIB.ServiceRequest(), function(result) {
            console.log(result.q[0]);
            wc_set_kuka_configuration(result.q);
        });
    } catch (err) {
        console.log(err.message);
    }
}

/* This function is being run in a loop, it monitors ROS structures */
function wc_update_ros_structure() {
    try {
        wc_srv_topics.callService(new ROSLIB.ServiceRequest(), function(result) {
            var topics_workcell_str = '';
            for (var i in result.topics) {
              topics_workcell_str += result.topics[i]+'<br />';
            }
            document.getElementById('ros_wc_topics').innerHTML = topics_workcell_str;
        });
        wc_srv_nodes.callService(new ROSLIB.ServiceRequest(), function(result) {
            var nodes_workcell_str = '';
            for (var i in result.nodes) {
              nodes_workcell_str += result.nodes[i]+'<br />';
            }
            document.getElementById('ros_wc_nodes').innerHTML = nodes_workcell_str;
        });
        wc_srv_services.callService(new ROSLIB.ServiceRequest(), function(result) {
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