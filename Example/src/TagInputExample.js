import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';
import TagInput from 'react-native-tag-input';

export default class TagInputExample extends Component {
  state = {
    tags: [],
  };

  onChangeTags = (tags) => {
    this.setState({
      tags,
    });
  };

  render() {
    const inputProps = {
      keyboardType: 'default',
      placeholder: 'email',
      autoFocus: true,
    };

    return (
      <View style={{ flex: 1, margin: 10, marginTop: 30 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
          <Text>To: </Text>
          <TagInput
            value={this.state.tags}
            onChange={this.onChangeTags}
            tagColor="blue"
            tagTextColor="white"
            inputProps={inputProps}
            numberOfLines={2}
          />
        </View>
      </View>
    );
  }
}
