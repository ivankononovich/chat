import React, { Component} from 'react';

import Header from  './header.component';
import ChatContainer from './chat-container.component';
import LogInPopup from './log-in-popup.component';
import webSocketHelper from '../helpers/app.helper';


class App extends Component {
    state = { 
        isActivePage: true,
        isLogIn: window.localStorage.nickName,
        allMessage: [],
        loadMessage: [],
        connected: false,
        requiredToDownload: 10,
        sizeUploadMessage: 10,
        indexLastLoadMessage: null,
        scrollBottom: true,
    }

    setNickNameEvent() {
        const nickName = document.querySelector('.popup__name').value;
        window.localStorage.setItem('nickName', nickName);

        this.setState({
            isLogIn: nickName,
        })
    }

    logOut() {
        window.localStorage.clear();

        this.setState({
            isLogIn: null,
        })
    }

    upadteMore() {
        const sizeUploadMessage = this.state.sizeUploadMessage;
        
        webSocketHelper.updateMessage(this, null, sizeUploadMessage);

        this.setState({
            scrollBottom: false,
        });
    }

    sendMessage(event) {
        event.preventDefault();

        const messageInput = document.querySelector('.chat__input-fields');
        const messageText = messageInput.value;

        if (this.state.connected) {
            messageInput.value = '';
        }

        webSocketHelper.sendData(JSON.stringify({
            from: this.state.isLogIn,
            message: messageText,
        }));
    }

    componentDidMount() {
        webSocketHelper.initEvents({
            onerror: (error) => {
                console.log(error.message);
            },
            onopen: () => {
                this.setState({
                    connected: true,
                });
            },
            onclose: () => {
                this.setState({
                    connected: false,
                });

                webSocketHelper.reconnecting(1000);
            },
            onmessage: (event) => {
                webSocketHelper.updateMessage(this, JSON.parse(event.data));
            },
        });

        window.addEventListener('blur', () => {
            this.setState({
                isActivePage: false,
            })
        })
        
        window.addEventListener('focus', () => {
            this.setState({
                isActivePage: true,
            })
        })
    }

    render() {
        const nickName = this.state.isLogIn;

        let renderItem = <>
            <Header 
                nickName={ nickName } 
                onClick={() => { this.logOut() }}
            />
            <ChatContainer 
                upadteMore={() => { this.upadteMore() }}
                sendMessage={(event) => { this.sendMessage(event) }} 
                loadMessage={ this.state.loadMessage }
                scrollBottom={ this.state.scrollBottom }
            />
        </>;

        if (!nickName) {
            renderItem = <LogInPopup onClick={() => { this.setNickNameEvent() }}/>;
        }

        return renderItem
    }
}

export default App;