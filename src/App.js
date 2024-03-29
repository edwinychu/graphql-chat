import React, { Component } from 'react';

// Import GraphQL helpers
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

// App component styles
import './App.css';
import logo from './logo.svg';

// import Chatbox UI component
import Chatbox from './components/Chatbox';


class App extends Component {
  state = {
    from: 'anonymous',
    content: ''
  };

  componentDidMount() {
    //Get username from prompt
    // when page loads
    const from = window.prompt('username');
    from && this.setState({ from }); 
    this._subscribeToNewChats();
  }

  _subscribeToNewChats = () => {
    this.props.allChatsQuery.subscribeToMore({
      document: gql`
        subscription {
          Chat(filter: { mutation_in: [CREATED] }) {
            node {
              id
              from
              content
              createdAt
            }
          }
        }
      `,
      updateQuery: (previous, { subscriptionData }) => {
        const newChatLinks = [
          ...previous.allChats,
          subscriptionData.data.Chat.node
        ];
        const result = {
          ...previous,
          allChats: newChatLinks
        };
        console.log(result, previous, subscriptionData);
        return result;
      }
    });
  };

  _createChat = async e => {
    if (e.key === 'Enter') {
      const { content, from } = this.state;
       await this.props.createChatMutation({
         variables: { content, from }
       });
       this.setState({ content: '' });
     }
   };

  render() {
    const allChats = this.props.allChatsQuery.allChats || [];
    return (
      <div className="">
        <div className="container">
          <h2>Chats</h2>
          {allChats.map(message => (
            <Chatbox key={message.id} message={message} />
          ))}

          {/* Message content input */}
          <input
            value={this.state.content}
            onChange={e => this.setState({ content: e.target.value })}
            type="text"
            placeholder="Start typing"
            onKeyPress={this._createChat}
          />
        </div>
      </div>
    );
  }

  
}


// create the query
const ALL_CHATS_QUERY = gql`
  query AllChatsQuery {
    allChats {
      id
      createdAt
      from
      content
    }
  }
`;

// create chat mutations
const CREATE_CHAT_MUTATION = gql`
  mutation CreateChatMutation($content: String!, $from: String!) {
    createChat(content: $content, from: $from) {
      id
      createdAt
      from
      content
    }
  }
`;

export default compose(
  graphql(ALL_CHATS_QUERY, { name: 'allChatsQuery '}),
  graphql(CREATE_CHAT_MUTATION, { name: 'createChatMutation' })
)(App);

