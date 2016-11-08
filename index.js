import React, { PropTypes, Component } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import _ from 'lodash';

const { width } = Dimensions.get('window');

class EmailInput extends Component {
  static defaultProps = {
    onChangeText: () => {},
    tagColor: '#dddddd',
    tagTextColor: '#777777',
    inputColor: '#777777',
  };

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired,
    onChangeText: PropTypes.func,
    regex: PropTypes.object,
    tagColor: PropTypes.string,
    tagTextColor: PropTypes.string,
    inputColor: PropTypes.string,
  }

  state = {
    text: '',
    inputWidth: 200,
  };

  _scrollToBottomY = null;
  wrapperWidth = width;

  measureWrapper = () => {
    if (!this.refs.wrapper)
      return;

    this.refs.wrapper.measure((ox, oy, w, /*h, px, py*/) => {
      this.wrapperWidth = w;
    });
  };

  calculateWidth = () => {
    setTimeout(() => {
      if (!this.refs['tag' + (this.props.value.length - 1)])
        return;

      this.refs['tag' + (this.props.value.length - 1)].measure((ox, oy, w, /*h, px, py*/) => {
        const endPosOfTag = w + ox;
        const margin = 3;
        const spaceLeft = this.wrapperWidth - endPosOfTag - margin;

        if (spaceLeft < 100) {
          this.setState({ inputWidth: this.wrapperWidth });
        } else {
          this.setState({ inputWidth: spaceLeft });
        }
      });
    }, 0);
  };

  componentDidMount() {
    setTimeout(() => {
      this.calculateWidth();
    }, 100);
  }

  componentWillReceiveProps() {
    this.calculateWidth();
  }

  componentDidUpdate(prevProps, /*prevState*/) {
    if (prevProps.value.length != this.props.value.length || !prevProps.value) {
      this.calculateWidth();
    }
  }

  onChange = (event) => {
    if (!event || !event.nativeEvent)
      return;

    const text = event.nativeEvent.text;
    this.setState({ text: text });
    const lastTyped = text.charAt(text.length - 1);

    const parseWhen = [',', ' ', ';'];

    if (parseWhen.indexOf(lastTyped) > -1)
      this.parseEmails();
  };

  parseEmails = () => {
    const { text } = this.state;
    const { value } = this.props;

    const regex = this.props.regex || /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const results = text.match(regex);

    if (results && results.length > 0) {
      this.setState({ text: '' });
      this.props.onChange(value.concat(results));
    }
  };

  onKeyPress = (event) => {
    if (this.state.text === '' && event.nativeEvent && event.nativeEvent.key == 'Backspace') {
      this.pop();
    }
  };

  focus = () => {
    if (this.refs.emailInput)
      this.refs.emailInput.focus();
  };

  pop = () => {
    const emails = _.clone(this.props.value);
    emails.pop();
    this.props.onChange(emails);
    this.focus();
  };

  removeIndex = (index) => {
    const emails = _.clone(this.props.value);
    emails.splice(index, 1);
    this.props.onChange(emails);
    this.focus();
  };

  render() {
    const { text } = this.state;
    const { value, tagColor, tagTextColor, inputColor } = this.props;
    let { inputProps } = this.props;

    const defaultInputProps = {
      autoCapitalize: 'none',
      autoCorrect: false,
      placeholder: 'Start typing',
      returnKeyType: 'done',
      keyboardType: 'email-address',
      underlineColorAndroid: 'rgba(0,0,0,0)',
    }

    inputProps = { ...defaultInputProps, ...inputProps };

    const width = text.length < 4 ? 100 : null;

    return (
      <TouchableWithoutFeedback
        onPress={() => this.refs.emailInput.focus()}
        onLayout={this.measureWrapper}
        style={styles.container}>
        <View
          style={styles.wrapper}
          ref="wrapper"
          onLayout={this.measureWrapper}>
          {value.map((email, index) => (
            <TouchableOpacity
              key={index}
              ref={'tag' + index}
              style={[
                styles.tag, {
                  backgroundColor: tagColor,
                }]}
              onPress={() => this.removeIndex(index)}>
              <Text style={[
                styles.tagText, {
                  color: tagTextColor,
                },
              ]}>{email}&nbsp;&times;</Text>
            </TouchableOpacity>
          ))}
          <View style={[styles.textInputContainer, { width: this.state.inputWidth }]}>
            <TextInput
              ref="emailInput"
              {...inputProps}
              blurOnSubmit={false}
              onKeyPress={this.onKeyPress}
              value={this.state.text}
              style={[styles.textInput, {
                width: width,
                color: inputColor,
              }]}
              onChange={this.onChange}
              onChangeText={this.props.onChangeText}
              onSubmitEditing={this.parseEmails}/>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
    marginBottom: 2,
    alignItems: 'flex-start',
  },
  textInput: {
    height: 36,
    fontSize: 16,
    flex: .6,
    marginBottom: 6,
    padding: 0,
    flexWrap: 'wrap',
  },
  textInputContainer: {
    height: 36,
  },
  tag: {
    justifyContent: 'center',
    marginTop: 6,
    marginRight: 3,
    flexWrap: 'wrap',
    padding: 8,
    height: 24,
    borderRadius: 2,
  },
  tagText: {
    padding: 0,
    margin: 0,
  },
});

export default EmailInput;
