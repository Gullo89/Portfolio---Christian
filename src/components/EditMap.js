import React, { Component } from 'react';
import EditMapForm from "./editmap/EditMapForm";
import moment from 'moment';

class EditMap extends Component {
    constructor() {
        super();
        this.state = {
            maps: [],           // All the maps fetched from database
            mapIndex: null,     // Index of map selected
            mapEdit: null,       // Map selected, this is what is changed when editing
            mapEditImages: [],
            selectedFile: null,
            fileValid: false,
            filterMaps: "all",
            //selectedTypes: []
        }
    }

    componentDidMount() {
        this.getMaps("all");
    }

    getMaps(filter) {
        //let filter = this.state.filterMaps;
        let url = "/maps";
        url += filter === "all" ? "" : "/" + filter;
        fetch(url)
            .then(res => res.json())
            .then(maps => this.setState({maps}, () => {
                console.log("Maps fetched..", maps);
                //console.log(this.state.maps[2]);
            }));
    }

    handleSelectMap(e) {
        console.log("changed: " + e.target.value);
        let mapId = e.target.value;
        let maps = this.state.maps;
        let mapIndex = null;
        if (e.target.value !== "-1") {
            /*
            Iterate through all the map objects, if the id of teh object matches the mapId
            of the event target, then set the mapIndex and break the loop.
            The mapIndex is used to send the correct map information to the MapModal component.
            */
            for (var i = 0; i < maps.length; i++) {
                if (parseInt(maps[i].id, 10) === parseInt(mapId, 10)) {
                    //console.log(maps[i].name);
                    mapIndex = i;
                    break;
                }
            }
        }
        console.log("Selected map:", this.state.maps[mapIndex]);
        this.setState({
            mapIndex: mapIndex,
            mapEdit: this.state.maps[mapIndex],
            selectedFile: null,
            fileValid: false
        });
        fetch(`/maps/${mapId}/images`)
            .then(res => res.json())
            .then(mapEditImages => this.setState({mapEditImages}, () => {
                console.log("Images fetched..", mapEditImages);
                //console.log(this.state.maps[2]);
            }));
    }

    getMapImages() {
        fetch(`/maps/${this.state.mapEdit.id}/images`)
            .then(res => res.json())
            .then(mapEditImages => this.setState({mapEditImages}, () => {
                console.log("Images fetched..", mapEditImages);
                //console.log(this.state.maps[2]);
            }));
    }

    handleResetForm() {
        console.log("Resetting form..");
        let mapIndex = this.state.mapIndex;
        this.setState({
            mapEdit: this.state.maps[mapIndex]
        });
    }
    /* Update state with changes and save to database */
    //// TODO: Save changes in database
    handleSubmitChanges() {
        console.log("Time to submit changes..");
        let mapIndex = this.state.mapIndex;
        let maps = this.state.maps;
        maps[mapIndex] = this.state.mapEdit;
        console.log(maps[mapIndex].id);
        let {id, game, status, download, ...data} = this.state.mapEdit;
        console.log(data);

        fetch(`/maps/${maps[mapIndex].id}`, {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        //.then(res => res.json())
        .then(res => {
            //this.getMapImages();
        })

        this.setState({
            maps: maps
        });

    }

    handleUserInput(e) {
        const inputName = e.target.name;
        let inputValue = e.target.value;
        if (inputName === "progress") { inputValue = parseInt(inputValue, 10); }
        console.log("Value: " + inputValue);
        this.setState(prevState => ({
            mapEdit: {
                ...prevState.mapEdit,
                [inputName]: inputValue
            }
        }));
    }

    handleChangeDate(date) {
        //console.log(moment(date).format("YYYY-MM-DD"));
        this.setState(prevState => ({
            mapEdit: {
                ...prevState.mapEdit,
                releaseDate: moment(date).format("YYYY-MM-DD")
            }
        }));
    }

    handleDeleteImage(id) {
        console.log("Gonna delete image with id: " + id);
        console.log(`/images/${id}`);
        fetch(`/images/${id}`, {
            method: "DELETE"
        }).then(res => {
            console.log("Image deleted!");
            //this.getMessages()
            this.getMapImages();
        })
    }

    handleFileSelect(e) {
        let file = e.target.files[0];
        let fileValid = true;
        console.log("Selected file..", file);
        // If File size is greater than 1 MB
        if (file.size > 1048576) {
            console.log("File size too big!");
            fileValid = false;
        }

        this.setState({
            selectedFile: e.target.files[0],
            fileValid: fileValid
        });
    }

    handleFileSubmit(e) {
        e.preventDefault();
        console.log("Time to submit image..");
        var data = new FormData();
        data.append("mapName", this.state.mapEdit.name);
        data.append("mapId", this.state.mapEdit.id);
        data.append("mapImage", this.state.selectedFile, this.state.selectedFile.name);
        fetch("/upload-map-image", {
            method: "POST",
            body: data
        })
        .then(res => res.json())
        .then(res => {
            //console.log(res);
            // Update the state with the newly inserted file to update UI
            /*let mapEditImages = this.state.mapEditImages;
            mapEditImages.push(res);
            this.setState({
                mapEditImages: mapEditImages
            });*/
            this.getMapImages();
        })
    }

    handleMapFilter(filter) {
        console.log("Selected: " + filter);
        this.getMaps(filter);
    }

    handleSelectGame(e) {
        console.log(e.target.value);
        let selectedGame = parseInt(e.target.value, 10);
        this.setState(prevState => ({
            mapEdit: {
                ...prevState.mapEdit,
                gameId: selectedGame
            }
        }));
    }

    handleAddType(types) {
        console.log("mapEdit: ", this.state.mapEdit);
        console.log("Gonna add these types to current list..", types);
        console.log("currentTypes before: " , this.state.mapEdit.type);
        let currentTypes = this.state.mapEdit.type
        for (let i = 0; i < currentTypes.length; i++) {
            console.log("currentTypes[" + i + "] " + typeof(currentTypes[i]));
            if (currentTypes[i] === undefined) {
                continue;
            }
            for (let j = 0; j < types.length; j++) {
                console.log("types[" + j + "]" + typeof(types[j]));
                if (currentTypes[i].id !== types[j].id) {
                    console.log(currentTypes[i].id + " !== " + types[j].id);
                    console.log("currentTypes after: " , currentTypes);
                    //console.log(types[j]);
                    currentTypes.push(types[i]);
                    this.setState(prevState => ({
                        mapEdit: {
                            ...prevState.mapEdit,
                            type: currentTypes
                        }
                    }));
                    break;
                }
            }
        }

        /*this.setState(prevState => ({
            mapEdit: {
                ...prevState.mapEdit,
                type: moment(date).format("YYYY-MM-DD")
            }
        }));*/
    }

    render() {
        //console.log(this.state.mapEdit);
        let selectedMap = this.state.mapEdit !== null ? this.state.mapEdit.id : null;
        return (
            <div className="map-edit-container">
                <div>Edit map here..</div>
                <div className="map-edit-left-container">
                    <div className="map-edit-add-btn">
                        <button>+</button>
                    </div>
                    <div className="map-edit-select-filter">
                        <div><button
                            onClick={() => this.handleMapFilter("all")}
                            className={this.state.filterMaps === "all" ? "filter-selected" : ""}>All
                            </button>
                        </div>
                        <div><button
                            onClick={() => this.handleMapFilter("released")}
                            className={this.state.filterMaps === "released" ? "filter-selected" : ""}>Released
                            </button>
                        </div>
                        <div><button
                            onClick={() => this.handleMapFilter("unreleased")}
                            className={this.state.filterMaps === "unreleased" ? "filter-selected" : ""}>Unreleased
                            </button>
                        </div>
                    </div>
                    <div className="clear-fix"></div>
                    <div className="map-edit-select-container">
                        <ul>
                            {this.state.maps.map(map =>
                                <li
                                    key={map.id}
                                    value={map.id}
                                    className={map.id === selectedMap ? "map-selected" : ""}
                                    onClick={this.handleSelectMap.bind(this)}>{map.name}</li>
                            )}
                        </ul>
                    </div>
                </div>
                {this.state.mapIndex !== null &&
                    <EditMapForm
                        map={this.state.mapEdit}
                        mapImages={this.state.mapEditImages}
                        handleUserInput={this.handleUserInput.bind(this)}
                        handleResetForm={this.handleResetForm.bind(this)}
                        handleSubmitChanges={this.handleSubmitChanges.bind(this)}
                        handleDeleteImage={this.handleDeleteImage.bind(this)}
                        handleFileSelect={this.handleFileSelect.bind(this)}
                        handleFileSubmit={this.handleFileSubmit.bind(this)}
                        handleChangeDate={this.handleChangeDate.bind(this)}
                        handleSelectGame={this.handleSelectGame.bind(this)}
                        handleAddType={this.handleAddType.bind(this)}
                        fileValid={this.state.fileValid}
                    />
                }
                <div className="clear-fix"></div>
            </div>
        );
    }
}

export default EditMap;
