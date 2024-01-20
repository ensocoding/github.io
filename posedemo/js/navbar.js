/**
 * A simple navbar toggle functionality
 *  @author (c) 2021 EnsoCoding
 *  @license GPL-2.0
 */
"use strict";

/* Navbar static class */
var NAVBAR = {};

/* Navbar collapsed flag */
NAVBAR.isNavcollapsed = true;

/* Navbar toogle */
NAVBAR.toggle = function(navbar) {

    let navMenu = document.getElementById(navbar);
    if (NAVBAR.isNavcollapsed) {
        NAVBAR.isNavcollapsed = false;
        navMenu.className = "navbar collapse show";
    } else {
        NAVBAR.isNavcollapsed = true;
        navMenu.className = "navbar collapse";
    }
};