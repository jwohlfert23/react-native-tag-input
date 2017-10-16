import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  Platform,
} from 'react-native';
import TagInput from 'react-native-tag-input';

export default class TagInputExample extends Component {
  state = {
    tags: [],
    horizontalTags: [],
  };

  onChangeTags = (tags) => {
    this.setState({
      tags,
    });
  };

  onChangeHorizontalTags = (horizontalTags) => {
    this.setState({
      horizontalTags,
    });
  };

  labelExtractor = (tag) => tag;

  onParsePendingInput = () => {
    this.refs.horizontalTagInput.parseTags();
  }

  onaddCustomTag = () => {
    this.refs.horizontalTagInput.addCustomTag('Suggested Tag');
  }

  render() {
    const inputProps = {
      keyboardType: 'default',
      placeholder: 'email',
      autoFocus: true,
    };

    const horizontalInputProps = {
      keyboardType: 'default',
      placeholder: 'Search',
      returnKeyType: 'search',
      style: {
        fontSize: 14,
        marginVertical: 10,
      },
    };

    return (
      <View style={{ flex: 1, margin: 10, marginTop: 30 }}>

        <Text style={{marginVertical: 10}}>Vertical Scroll</Text>
        <View style={{marginBottom: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'lightblue'}}>
          <Text>To: </Text>
          <TagInput
            value={this.state.tags}
            onChange={this.onChangeTags}
            labelExtractor={this.labelExtractor}
            tagColor="blue"
            tagTextColor="white"
            inputProps={inputProps}
            maxHeight={75}
          />
        </View>

        <Text style={{marginVertical: 10}}>Horizontal Scroll</Text>
        <View style={{marginBottom: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'lightblue'}}>
          <Text>To: </Text>
          <TagInput
            ref='horizontalTagInput'
            value={this.state.horizontalTags}
            onChange={this.onChangeHorizontalTags}
            labelExtractor={this.labelExtractor}
            tagColor="blue"
            tagTextColor="white"
            inputProps={horizontalInputProps}
            maxHeight={75}
            separators={[]}
            parseOnSubmit={false}
            clearTextWhenRemoveTag
            scrollHorizontal
          />
        </View>

        <View style={{marginVertical: 10, backgroundColor: Platform.OS == 'ios' ? '#841584' : 'transparent'}}>
          <Button
            onPress={this.onParsePendingInput}
            title="Parse input"
            color={Platform.OS == 'ios' ? 'white' : '#841584'}
          />
        </View>
        <View style={{marginVertical: 10, backgroundColor: Platform.OS == 'ios' ? '#841584' : 'transparent'}}>
          <Button
            onPress={this.onaddCustomTag}
            title="Replace input to suggested tag"
            color={Platform.OS == 'ios' ? 'white' : '#841584'}
          />
        </View>
      </View>
    );
  }
}
