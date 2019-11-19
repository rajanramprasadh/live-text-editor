import React, { Component } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw } from 'draft-js';
import axios from '../../axios-comments';

import classes from './LiveEditor.module.css';
import Aux from '../../hoc/Axilliary/Auxilliary';

class LiveEditor extends Component {
    state = {
        editorState: EditorState.createEmpty(),
        content: '',
        loading: true,
        error: '',
        comments: []
    }

    onChange = (editorState) => {
        this.setState({
            editorState
        })
    }

    handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    onItalicClick = () => {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
    }

    onBoldClick = () => {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
    }

    onUnderLineClick = () => {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'UNDERLINE'));
    }

    onStrikethroughClick = () => {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'STRIKETHROUGH'));
    }

    onSubmitComment = () => {
        const content = convertToRaw(this.state.editorState.getCurrentContent()).blocks;
        const finalContent = {
            comment: content.map(blocks => (!blocks.text.trim() && '\n') || blocks.text).join('\n')
        }
        axios.post('/comments.json', finalContent)
            .then(response => {
                this.setState({ loading: false });
            })
            .catch(error => {
                this.setState({ loading: false });
                console.log(error);
            });
    }

    onShowComment = () => {
        axios.get('/comments.json')
            .then(res => {
                const fetchedComments = [];
                for (let key in res.data) {
                    fetchedComments.push({
                        ...res.data[key],
                        id: key
                    });
                }
                this.setState({ loading: !this.state.loading, comments: fetchedComments });
            })
            .catch(err => {
                this.setState({ loading: false });
            });
    }

    render() {
        let displayComments = (<h1>Comments Hidden</h1>);
        debugger;
        if (!this.state.loading) {
            displayComments = this.state.comments.map(comment => {
                return (
                    <div key={comment.id} className={classes.Comment}>{comment.comment}</div>
                );
            })
        }
        return (
            <Aux>
                <div className={classes.LiveEditor}>
                    <div className={classes.ButtonItems}>
                        <button onClick={this.onItalicClick} className={classes.Button}>
                            <em>Italic</em>
                        </button>
                        <button onClick={this.onBoldClick} className={classes.Button}><b>Bold</b></button>
                        <button onClick={this.onUnderLineClick} className={classes.Button}><u>Underline</u></button>
                        <div className={classes.Divider} />
                        <button
                            onClick={this.onStrikethroughClick}
                            className={classes.Button}><strike>Strike</strike></button>
                    </div>
                    <div className={classes.Editor}>
                        <Editor
                            editorState={this.state.editorState}
                            handleKeyCommand={this.handleKeyCommand}
                            onChange={this.onChange} />
                    </div>
                    <button onClick={this.onSubmitComment} className={classes.Button}>Submit</button>
                </div>
                <div className={classes.CommentSection}>
                    <button onClick={this.onShowComment} className={classes.Button}>{this.state.loading ? "Unhide Comment" : "Hide Comment"}</button>
                    {displayComments}
                </div>
            </Aux>
        );
    }
}

export default LiveEditor;