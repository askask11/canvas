// ==UserScript==
// @name         The Lucky Canvas Plugin
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  This is the canvas side of the lucky canvas app. Please visit canvas and click on "grades"to use this application. This plugin is bulit to get data from canvas.
// @author       Johnson Gao
// @match        https://*.instructure.com/courses/*/grades
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// @grant        none
// ==/UserScript==

//main method
(function() {
    
    // Your code here...
    show();

    //add action listener
    $(document).ready(
     $("#johnson").click(function(){
    getAssignments();
  })
    );

}

)();

const SPLIT_S="∧";

const SPLIT_B="∨";

function show(){
    //document.getElementsByTagName("head")[0].innerHTML="<script src='https://canvas.villagechemcats.com/canvasScript.js'></script>"+document.getElementsByTagName("head")[0].innerHTML;
   document.getElementById("section-tabs").innerHTML= "<li class='section' style=' background-color:rgb(153,255,153);border-style=inset;border-color:orange;margin-top:2px;margin-button:2px;cursor:pointer;'><a id='johnson'><img src='https://fontmeme.com/permalink/191226/3f18f9ffa7a6dcc86016aae6d61318b7.png' alt='visit the lucky canvas' title='Visit Lucky Canvas'></span></a>"+document.getElementById("section-tabs").innerHTML;
}


function getAssignments()
{
    var ids = new Array();
    var assignments = document.getElementsByClassName('student_assignment');
    var assignmentGroup = new Array();

    //get possible ids
    for (var i = 0; i < assignments.length; i++)
    {
        var realId = assignments[i].id.substring(assignments[i].id.indexOf("_") + 1, assignments[i].id.length);
        if (!isNaN(parseInt(realId)))
        {
            ids[ids.length] = realId;
//            out(realId);
        }
    }

    //main submission format: submission_

    //get the student gradebook from the website.
    for (var i = 0; i < ids.length; i++)
    {
        var submission = document.getElementById("submission_" + ids[i]);
        var average = document.getElementById("grade_info_" + ids[i]);
        var assignment = new Assignment();
        //console.log(i);
        //
        //only run if the assignment is greaded.
        if (submission.classList.contains("assignment_graded"))
        {
            //out("name: " + submission.children[0].children[0].innerHTML);//name
            assignment.title = submission.children[0].children[0].innerHTML.trim();


            // out("catagory: " + submission.children[0].children[1].innerHTML);//catagory
            assignment.catagory = submission.children[0].children[1].innerHTML.trim();

            //out("duedate: " + submission.children[1].innerHTML.trim());//duedate
            assignment.duedate = submission.children[1].innerHTML.trim();


            //On canvas, the grade are randomly wrapped together. Use this loop to unwrap the grade.
            var gradeBunch = submission.children[2].children[0].children;
            for (var j = 0; j < gradeBunch.length; j++)
            {
                if (gradeBunch[j].getAttribute("class") === "tooltip")//the grade must be sourounded by "tooltip"tag
                {

                    //out("grade: " + gradeBunch[j].children[0].innerText.replace("Click to test a different score", ""));//grade
                    assignment.grade = gradeBunch[j].children[0].innerText.replace("Click to test a different score", "").trim();//grade
                }
            }
            //possibel grade
//            out("possible grade: " + submission.children[3].innerHTML);
            assignment.points_possible = submission.children[3].innerHTML.trim();

            //mean grade
//            out("Mean: " + average.children[0].children[0].children[1].children[0].children[0].innerHTML.replace("Mean:", ""));
            assignment.mean = average.children[0].children[0].children[1].children[0].children[0].innerHTML.replace("Mean:", "").trim();

            //highest grade
//            out("High: " + average.children[0].children[0].children[1].children[0].children[1].innerHTML.replace("High:", ""));
            assignment.high = average.children[0].children[0].children[1].children[0].children[1].innerHTML.replace("High:", "").trim();

//            out("Low: " + average.children[0].children[0].children[1].children[0].children[2].innerHTML.replace("Low:", ""));
            assignment.low = average.children[0].children[0].children[1].children[0].children[2].innerHTML.replace("Low:", "").trim();

//            console.log(assignment);
            assignmentGroup[assignmentGroup.length] = assignment;
        }

    }
    outputGradeBook(assignmentGroup);
    return assignmentGroup;
}

class Assignment
{
    constructor(title, due, grade, possible, mean, high, low,catagory)
    {
        this.title = title;
        this.duedate = due;
        this.grade = grade;
        this.points_possible = possible;
        this.mean = mean;
        this.high = high;
        this.low = low;
        this.catagory = catagory;
    }
    toString()
    {
        return "{ name=" + this.title + ",\n duedate=" + this.duedate + ",\n grade=" + this.grade + ",\n possible points=" + this.points_possible + ",\n mean=" + this.mean + ", \n high=" + this.high + ", \n low=" + this.low + ", catagory="+ this.catagory+" }";
    }
}

class Weight
{
    constructor(catagory,weight)
    {
        this.catagory = catagory;
        this.weight = weight;
    }

    toString()
    {
        return "{ catagory: " + this.catagory +", weight: " + this.weight + "}";
    }

}

/**
 * This appends the gradebook appedix and transfer it to the target side.
 * @param {Array} gradebook
 * @returns {undefined}
 */
function outputGradeBook(gradebook)
{
    var appendix = "";
    var weightgroups = new Array();
    var weightGroupDOM = new Array();

    for (var i = 0; i < gradebook.length; i++)
    {
        var assignment = gradebook[i];
        appendix += "\n\
        " + assignment.title + "∧" + assignment.duedate + "∧" + assignment.grade + "∧" + assignment.points_possible + "∧" + assignment.mean + "∧" + assignment.high + "∧" + assignment.low + "∧" + assignment.catagory + "|\n";
    }
    appendix += "∨";

    if (document.getElementsByClassName('summary')[0] === undefined)
    {
        appendix += "NA";
    } else {

        weightGroupDOM = document.getElementsByClassName('summary')[0].children[1].children;


        //
        for (var i = 0; i < weightGroupDOM.length/*Skip the last object*/; i++) {
            //get the dom of the currentlu reading weight
            var weightDOM = weightGroupDOM[i];
            var weightObj = new Weight();
            //read catagory and weight from canvas
            weightObj.catagory = weightDOM.children[0].innerHTML.replace("%", "");
            weightObj.weight = weightDOM.children[1].innerHTML.replace("%", "");
            //write in array
            weightgroups[weightgroups.length] = weightObj;
        }


    //Thie is for the weight of each assignment.
        for (var i = 0; i < weightgroups.length - 1; i++) {
            var weightObj = weightgroups[i];
            appendix += weightObj.catagory + "∧" + weightObj.weight + "|";
        }

        /**GET USER**/
        appendix += "∨" + document.getElementsByClassName('ic-avatar')[0].children[0].getAttribute("alt");



    }

    //localStorage.setItem("gradebook", appendix);
    //console.log("item stored");
    window.location = "https://canvas.villagechemcats.com/LuckyMain.html?" + appendix;
}

