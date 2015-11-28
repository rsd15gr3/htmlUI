
/* This function is called every time the site is refreshed */
function on_loaded_page() {
    /* Init all components on the web page first */
    init_page_components();

    /* Init connections to ROS cores */
    frobit_init_ros();
    wc_init_ros();

    /* Inform user about loading the page */
    to_console('Website loaded.')
}

function init_page_components() {
    put_joystick();
    wc_init_manual_control();
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

/* Show text in self-created console in our UI */
function to_console(text) {
    var ta = document.getElementById('textarea_console');
    ta.value += "\n=> "+text;
    ta.scrollTop = ta.scrollHeight;
}

function on_mes_frobit_change(value) {
    var msg = new ROSLIB.Message({data : value});
    ui_mes_frobit_topic.publish(msg);
}
