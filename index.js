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

  constructor(props) {
    super(props);

    this.wrapperWidth = width;
    this.parseEmails = this.parseEmails.bind(this);
    this.onChange = this.onChange.bind(this);
    this.pop = this.pop.bind(this);
    this.calculateWidth = this.calculateWidth.bind(this);
    this.focus = this.focus.bind(this);
  }

  measureWrapper() {
    if (!this.refs.wrapper)
      return;

    this.refs.wrapper.measure((ox, oy, w, /*h, px, py*/) => {
      this.wrapperWidth = w;
    });
  }

  calculateWidth() {
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
  }

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

  onChange(event) {
    if (!event || !event.nativeEvent)
      return;

    const text = event.nativeEvent.text;
    this.setState({ text: text });
    const lastTyped = text.charAt(text.length - 1);

    const parseWhen = [',', ' ', ';'];

    if (parseWhen.indexOf(lastTyped) > -1)
      this.parseEmails();
    }

  parseEmails() {
    const { text } = this.state;
    const { value } = this.props;

    const regex = this.props.regex || /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const results = text.match(regex);

    if (results && results.length > 0) {
      this.setState({ text: '' });
      this.props.onChange(value.concat(results));
    }
  }

  onKeyPress(event) {
    if (this.state.text === '' && event.nativeEvent && event.nativeEvent.key == 'Backspace') {
      this.pop();
    }
  }

  focus() {
    if (this.refs.emailInput)
      this.refs.emailInput.focus();
  }

  pop() {
    const emails = _.clone(this.props.value);
    emails.pop();
    this.props.onChange(emails);
    this.focus();
  }

  removeIndex(index) {
    const emails = _.clone(this.props.value);
    emails.splice(index, 1);
    this.props.onChange(emails);
    this.focus();
  }

  render() {
    const { text } = this.state;
    const { value } = this.props;
    let { inputProps } = this.props;

    const defaultInputProps = {
      autoCapitalize: 'none',
      autoCorrect: false,
      placeholder: this.props.placeholder || 'Start typing',
      returnKeyType: this.props.returnKeyType || 'done',
      keyboardType: this.props.keyboardType || 'email-address',
      underlineColorAndroid: 'rgba(0,0,0,0)',
    }

    inputProps = { ...defaultInputProps, ...inputProps };

    const width = text.length < 4 ? 100 : null;

    const tagColor = this.props.tagColor || '#dddddd';
    const tagTextColor = this.props.tagTextColor || '#777777';
    const inputColor = this.props.inputColor || '#777777';

    return (
      <TouchableWithoutFeedback
        onPress={() => this.refs.emailInput.focus()}
        onLayout={this.measureWrapper.bind(this)}
        style={styles.container}>
        <View
          style={styles.wrapper}
          ref="wrapper"
          onLayout={this.measureWrapper.bind(this)}>
          {value.map((email, index) => (
            <TouchableOpacity
              key={index}
              ref={'tag' + index}
              style={[
                styles.tag, {
                  backgroundColor: tagColor,
                }]}
              onPress={this.removeIndex.bind(this, index)}>
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
              onKeyPress={this.onKeyPress.bind(this)}
              value={this.state.text}
              style={[styles.textInput, {
                width: width,
                color: inputColor,
              }]}
              onChange={this.onChange.bind(this)}
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
