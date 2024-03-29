import './chatScreen.css';
import { useState, React, useEffect } from 'react';
import AddContactButton from '../../Contacts/AddContactButton';
import MessagesBox from '../../Contacts/MessagesBox';
import MessageScrollBar from './MessageScrollBar';
import View from './View';
import { HubConnectionBuilder } from '@microsoft/signalr';


function ChatScreen({activeUser}) {
    const MessagesList = [{'content':"", 'created': "", 'sent': ""}] 
    const [buttonPopUp, setButtonPopUp] = useState(false);
    const [videoPopUp, setVideoPopUp] = useState(false);
    const [recordPopUp, setRecordPopUp] = useState(false);
    const [messages, setMessage] = useState(MessagesList);
    const [startScreen, setStartScreen] = useState(true);
    const [currentContactState, setCurrentContact] = useState({'id':"", 'name': "", 'server': "", 'last': "", 'lastDate':""});
    const [index, setContactIndex] = useState(0);
    const [contactsList, setContactsList] = useState(activeUser.contacts);

    useEffect(() => {
        const connection = new HubConnectionBuilder()
        .withUrl('http://localhost:5001/MyHub')
        .withAutomaticReconnect()
        .build();
    
        connection.start()
                .then(result => {
                    connection.on("getNewMessage", function () {
                            if (currentContactState.id)
                            {
                                fetch('http://localhost:5001/api/contacts/' + currentContactState.id + '/messages?user=' + activeUser.userName).then(res => {
                                    const contentType = res.headers.get("content-type");
                                    if (contentType && contentType.indexOf("application/json") !== -1) {
                                        res.json().then(data => {                                        
                                            setMessage(data);
                                        })
                                    }
                                }).catch(e => console.log('fetch messages failed: ', e));
                            }
                        
                            fetch('http://localhost:5001/api/contacts?user=' + activeUser.userName).then(res => {
                                const contentType = res.headers.get("content-type");
                                if (contentType && contentType.indexOf("application/json") !== -1) {
                                    res.json().then(data => {
                                       
                                        setContactsList(data);
                                    })
                                }
                            }).catch(e => console.log('fetch contact failed: ', e));
                    })
    
                    connection.on("newContactInList", function () {
                        fetch('http://localhost:5001/api/contacts?user=' + activeUser.userName).then(res => {
                            const contentType = res.headers.get("content-type");
                            if (contentType && contentType.indexOf("application/json") !== -1) {
                                res.json().then(data => {
                                    setContactsList(data);
                                })
                            }
                        })    
                    })
                }).catch(e => console.log('Connection failed: ', e));
                
                return () => {
                    connection.stop();
                  };
    }, [activeUser, currentContactState])

    const addMessage = text => {
        text = text.trim();
        if (text != "") {          
            fetch('http://localhost:5001/api/contacts/' + currentContactState.id + '/messages?user=' + activeUser.userName).then(res => {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    res.json().then(data => {
                        setMessage(data);
                    })
                }
            })

            fetch('http://localhost:5001/api/contacts?user=' + activeUser.userName).then(res => {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    res.json().then(data => {
                        setContactsList(data);
                    })
                }
            })
        }
    };

    const addContact = function () {
        fetch('http://localhost:5001/api/contacts?user=' + activeUser.userName).then(res => {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                res.json().then(data => {
                    setContactsList(data);
                })
            }
        })
    }


    const changeContact = function (user) {
        let i = 0;
        for (; i < contactsList.length; i++) {
            if (contactsList[i].id == user) {
                break;
            }

        }
        setStartScreen(false);
        if (contactsList.length != 1) {
            setCurrentContact(contactsList[i]);
        }
        else {
            setCurrentContact(contactsList[0]);
        }
        
        fetch('http://localhost:5001/api/contacts/' + contactsList[i].id + '/messages?user=' + activeUser.userName).then(res => {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                res.json().then(data => {
                    setMessage(data);
                })
            }
        })

    }
    const addImg = (file) => {
        var fr = new FileReader();
        fr.onload = function () {
            let contact = contactsList[index];
            let new_message = {'type': "pic", 'data':fr.result, 'getM':false, 'time':new Date()}
            contact.time=new_message.time.toLocaleString();
            contact.lastMessage="Image";
            contact.messages.push(new_message);
            setContactsList(contactsList);
            setMessage([...messages, new_message]);
        }
        fr.readAsDataURL(file);
    };

    const addVideo = (file) => {
        var fr = new FileReader();
        fr.onload = function () {
            let contact = contactsList[index];
            let new_message = {'type': "video", 'data':fr.result, 'getM':false, 'time':new Date()}
            contact.time=new_message.time.toLocaleString();
            contact.lastMessage="Video";
            contact.messages.push(new_message);
            setContactsList(contactsList);
            setMessage([...messages, new_message])
        }
        fr.readAsDataURL(file);
    }

    const addAudio = (audio) =>{
        let contact = contactsList[index];
        let new_message = {'type': "audio", 'data':audio, 'getM':false, 'time':new Date()};
        contact.time=new_message.time.toLocaleString();
        contact.lastMessage="Audio";
        contact.messages.push(new_message);
        setContactsList(contactsList);
        setMessage([...messages, new_message]);
    }

    return (
        <div className="py-5 px-4 ">
            <div className="px-0 mylist">
                <a className="list-group-item list-group-item-action list-group-item-light rounded-0">
                    <div className="media"><img width="60" height="60" src={'User-Profile.png'} alt="user" className="rounded-circle"></img>&nbsp;Hi {activeUser.userName}!
                        <div className="media-body ml-4">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                            </div>
                        </div>
                    </div>
                </a>
                <div className="bg-gray px-4 py-2 bg-light">
                    <p className="h5 mb-0 py-1">Contacts &nbsp;&nbsp;&nbsp;&nbsp;
                        <span>
                            <AddContactButton addContact={addContact} user={currentContactState.id} activeUser={activeUser.userName} />
                        </span>
                        
                    </p>
                </div>
                <MessageScrollBar>
                    <MessagesBox contactsList={contactsList} changeContact={changeContact} />
                </MessageScrollBar>
            </div>
           
            <div className='chatBackground'>
                <View startScreen={startScreen} setButtonPopUp={setButtonPopUp} setVideoPopUp={setVideoPopUp} setRecordPopUp={setRecordPopUp} messages={messages}
                    buttonPopUp={buttonPopUp}
                    videoPopUp={videoPopUp}
                    addMessage={addMessage}
                    addAudio={addAudio}
                    addVideo={addVideo}
                    addImg={addImg}
                    currentContact={currentContactState.id}
                    currentPicture={'./User-Profile.png'}
                    recordPopUp={recordPopUp}
                    currentContactServer={currentContactState.server}
                    activeUser={activeUser.userName}
                />
            </div>
        </div>
    );
}


export default ChatScreen;
