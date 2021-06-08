var NoProjectMarker = "No Project";

getTaskSummary();

function getTaskSummary() {
    var doc = Application('OmniFocus').defaultDocument;

    var thisMorning = startOfDay();

    var tasks = doc.flattenedTasks.whose({completionDate: {'>=':thisMorning} })();
    if (tasks.length == 0) {
        return "No tasks completed. Do something without writing it down?";
    }
    
    var groupedTasks = groupArrayByKey(tasks, function(v) {
        var proj = v.containingProject();
        if (proj) {
            return proj.id();
        }
        return NoProjectMarker;
    });

    var allProjects = doc.flattenedProjects();
    var progressedProjects = allProjects.filter(function(p) {
        return p.id() in groupedTasks;
    });
    
    var summary = progressedProjects.reduce(function(s,p){
        return s + summaryForProject(p);
    }, "");
    
    var tasksWithNoProject = groupedTasks[NoProjectMarker];
    if (tasksWithNoProject) {
        summary += summaryForTasksWithTitle(tasksWithNoProject, "No Project\n");
    }
    
    return summary;

    function summaryForProject(p) {
        var projectID = p.id();
        var tasks = groupedTasks[projectID].filter(function(t) {
            return projectID != t.id(); // Don't include the project itself
        });
        return summaryForTasksWithTitle(tasks, projectSummaryLine(p));
    }
    function summaryForTasksWithTitle(tasks, title) {
        return title + tasks.reduce(summaryForTasks,"") + "\n";
    }
}

function summaryForTasks(s,t) {
    return s + lineForTask(t);
}

function projectSummaryLine(project) {
    var tokens = [];
    tokens.push("- **" + project.name() + "**");
    return tokens.join(" ") + "\n";
}

function lineForTask(task) {
    return "  - " + task.name() + "\n";
}

function groupArrayByKey(array,keyForValue) {
    var dict = {};
    for (var i = 0; i < array.length; i++) {
        var value = array[i];
        var key = keyForValue(value);
        if (!(key in dict)) {
            dict[key] = [];
        }
        dict[key].push(value);
    }
    return dict;
}

function startOfDay() {
    var d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    return d;
}
