fluid.defaults("flock.demo.oscilOscil", {
    gradeNames: "fluid.viewComponent",

    selectors: {
        playButton: "#playButton",
        nexusui: "#viz"
    },

    components: {
        enviro: {
            type: "flock.enviro"
        },

        playButton: {
            type: "flock.ui.enviroPlayButton",
            container: "{oscilOscil}.options.selectors.playButton",
            options: {
                listeners: {
                    // Due to a bug in Flocking, we need to
                    // connect/disconnect the Nexus components
                    // whenever the environment is played or pauses.
                    "onPlay.connectVisualization": {
                        func: "{nexusui}.events.onConnect.fire"
                    },
                    "onPause.disconnectVisualization": {
                        func: "{nexusui}.events.onDisconnect.fire"
                    }
                }
            }
        },

        synth: {
            type: "flock.demo.oscilOscil.synth"
        },

        nexusui: {
            type: "flock.demo.oscilOscil.nexusui",
            container: "{oscilOscil}.options.selectors.nexusui"
        }
    }
});

fluid.defaults("flock.demo.oscilOscil.synth", {
    gradeNames: "flock.synth",

    synthDef: {
        id: "oscosc",
        ugen: "flock.ugen.oscilOscil",
        options: {
            waves: ["saw", "sin", "hann"]
        },
        freq: {
            ugen: "flock.ugen.lfNoise",
            freq: 1,
            mul: 60,
            add: 120
        },
        mul: {
            ugen: "flock.ugen.asr",
            attack: 0.25,
            sustain: 0.5,
            release: 0.25,
            gate: {
                ugen: "flock.ugen.impulse",
                rate: "control",
                freq: 1,
                phase: 1.0
            }
        }
    }
});

fluid.defaults("flock.demo.oscilOscil.nexusui", {
    gradeNames: "fluid.viewComponent",

    members: {
        scope: null,
        spectrogram: null
    },

    model: {
        width: 300,
        height: 100
    },

    selectors: {
        scope: "#scope",
        spectogram: "#spectogram"
    },

    events: {
        onConnect: null,
        onDisconnect: null
    },

    listeners: {
        "onCreate.setWidth":{
            priority: "first",
            funcName: "flock.demo.oscilOscil.nexusui.setWidth",
            args: "{that}"
        },
        "onCreate.createScope": {
            funcName: "flock.demo.oscilOscil.nexusui.createScope",
            args: "{that}"
        },
        "onCreate.createSpectrum":{
            funcName: "flock.demo.oscilOscil.nexusui.createSpectrum",
            args: "{that}"
        },
        "onConnect.connectScope": {
            "this": "{that}.scope",
            method: "connect",
            args: "{enviro}.audioSystem.nativeNodeManager.outputNode"
        },
        "onConnect.connectSpectrum": {
            "this": "{that}.spectogram",
            method: "connect",
            args: "{enviro}.audioSystem.nativeNodeManager.outputNode"
        },
        "onDisconnect.disconnectScope": {
            "this": "{that}.scope",
            method: "disconnect",
            args: "{enviro}.audioSystem.nativeNodeManager.outputNode"
        },
        "onDisconnect.disconnectSpectrum": {
            "this": "{that}.spectogram",
            method: "disconnect",
            args: "{enviro}.audioSystem.nativeNodeManager.outputNode"
        }
    }
});

flock.demo.oscilOscil.nexusui.setWidth= function( that ){
    that.applier.change( "width", that.container.innerWidth() );
};

flock.demo.oscilOscil.nexusui.createSpectrum = function( that ){
    that.scope = new Nexus.Oscilloscope( that.options.selectors.scope, {
        size: [that.model.width, that.model.height]
    });
};

flock.demo.oscilOscil.nexusui.createScope = function( that ){
    that.spectogram = new Nexus.Spectrogram( that.options.selectors.scope, {
        size: [that.model.width, that.model.height]
    });
};
