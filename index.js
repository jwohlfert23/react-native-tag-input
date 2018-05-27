// @flow

import type {
  StyleObj,
} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import * as React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  ViewPropTypes,
  Platform,
} from 'react-native';
import invariant from 'invariant';

const windowWidth = Dimensions.get('window').width;

type KeyboardShouldPersistTapsProps =
  "always" | "never" | "handled" | false | true;
type RequiredProps<T> = {
  /**
   * An array of tags, which can be any type, as long as labelExtractor below
   * can extract a string from it
   */
  value: $ReadOnlyArray<T>,
  /**
   * A handler to be called when array of tags change. The parent should update
   * the value prop when this is called if they want to enable removal of tags
   */
  onChange: (items: $ReadOnlyArray<T>) => void,
  /**
   * Function to extract string value for label from item
   */
  labelExtractor: (tagData: T) => string | React.Element<any>,
  /**
   * The text currently being displayed in the TextInput following the list of
   * tags
   */
  text: string,
  /**
   * This callback gets called when the user types in the TextInput. The parent
   * should update the text prop when this is called if they want to enable
   * input. This is also where any parsing to detect new tags should occur
   */
  onChangeText: (text: string) => void,
};
type OptionalProps = {
  /**
   * If false, text input is not editable and existing tags cannot be removed.
   */
  editable: boolean,
  /**
   * Background color of tags
   */
  tagColor: string,
  /**
   * Text color of tags
   */
  tagTextColor: string,
  /**
   * Styling override for container surrounding tag text
   */
  tagContainerStyle?: StyleObj,
  /**
   * Styling override for tag's text component
   */
  tagTextStyle?: StyleObj,
  /**
   * Width override for text input's default width when it's empty and showing placeholder
   */
  inputDefaultWidth: number,
  /**
   * Color of text input
   */
  inputColor: string,
  /**
   * Any misc. TextInput props (autoFocus, placeholder, returnKeyType, etc.)
   */
  inputProps?: $PropertyType<TextInput, 'props'>,
  /**
   * Max height of the tag input on screen (will scroll if max height reached)
   */
  maxHeight: number,
  /**
   * Callback that gets passed the new component height when it changes
   */
  onHeightChange?: (height: number) => void,
  /**
   * Any ScrollView props (horizontal, showsHorizontalScrollIndicator, etc.)
  */
  scrollViewProps?: $PropertyType<ScrollView, 'props'>,
};
type Props<T> = RequiredProps<T> & OptionalProps;
type State = {
  inputWidth: number,
  wrapperHeight: number,
};

class TagInput<T> extends React.PureComponent<Props<T>, State> {

  static propTypes = {
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    labelExtractor: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    onChangeText: PropTypes.func.isRequired,
    editable: PropTypes.bool,
    tagColor: PropTypes.string,
    tagTextColor: PropTypes.string,
    tagContainerStyle: ViewPropTypes.style,
    tagTextStyle: Text.propTypes.style,
    inputDefaultWidth: PropTypes.number,
    inputColor: PropTypes.string,
    inputProps: PropTypes.shape(TextInput.propTypes),
    maxHeight: PropTypes.number,
    onHeightChange: PropTypes.func,
    scrollViewProps: PropTypes.shape(ScrollView.propTypes),
  };
  props: Props<T>;
  state: State;
  wrapperWidth = windowWidth;
  spaceLeft = 0;
  // scroll to bottom
  contentHeight = 0;
  // refs
  tagInput: ?TextInput = null;
  scrollView: ?ScrollView = null;

  static defaultProps = {
    editable: true,
    tagColor: '#dddddd',
    tagTextColor: '#777777',
    inputDefaultWidth: 90,
    inputColor: '#777777',
    maxHeight: 75,
  };

  static inputWidth(
    text: string,
    spaceLeft: number,
    inputDefaultWidth: number,
    wrapperWidth: number
  ) {
    if (text === "") {
      return inputDefaultWidth;
    } else if (spaceLeft >= 100) {
      return spaceLeft - 10;
    } else {
      return wrapperWidth;
    }
  }

  constructor(props: Props<T>) {
    super(props);
    this.state = {
      inputWidth: props.inputDefaultWidth,
      wrapperHeight: 36,
    }
  }

  componentWillReceiveProps(nextProps: Props<T>) {
    const inputWidth = TagInput.inputWidth(
      nextProps.text,
      this.spaceLeft,
      nextProps.inputDefaultWidth,
      this.wrapperWidth,
    );
    if (inputWidth !== this.state.inputWidth) {
      this.setState({ inputWidth });
    }
    const wrapperHeight = Math.min(
      nextProps.maxHeight,
      this.contentHeight,
    );
    if (wrapperHeight !== this.state.wrapperHeight) {
      this.setState({ wrapperHeight });
    }
  }

  componentWillUpdate(nextProps: Props<T>, nextState: State) {
    if (
      this.props.onHeightChange &&
      nextState.wrapperHeight !== this.state.wrapperHeight
    ) {
      this.props.onHeightChange(nextState.wrapperHeight);
    }
  }

  measureWrapper = (event: { nativeEvent: { layout: { width: number } } }) => {
    this.wrapperWidth = event.nativeEvent.layout.width;
    const inputWidth = TagInput.inputWidth(
      this.props.text,
      this.spaceLeft,
      this.props.inputDefaultWidth,
      this.wrapperWidth,
    );
    if (inputWidth !== this.state.inputWidth) {
      this.setState({ inputWidth });
    }
  }

  onBlur = (event: { nativeEvent: { text: string } }) => {
    invariant(Platform.OS === "ios", "only iOS gets text on TextInput.onBlur");
    this.props.onChangeText(event.nativeEvent.text);
  }

  onKeyPress = (event: { nativeEvent: { key: string } }) => {
    if (this.props.text !== '' || event.nativeEvent.key !== 'Backspace') {
      return;
    }
    const tags = [...this.props.value];
    tags.pop();
    this.props.onChange(tags);
    this.scrollToEnd();
    this.focus();
  }

  focus = () => {
    invariant(this.tagInput, "should be set");
    this.tagInput.focus();
  }

  removeIndex = (index: number) => {
    const tags = [...this.props.value];
    tags.splice(index, 1);
    this.props.onChange(tags);
  }

  scrollToEnd = () => {
    const scrollView = this.scrollView;
    invariant(
      scrollView,
      "this.scrollView ref should exist before scrollToEnd called",
    );
    setTimeout(() => {
      scrollView.scrollToEnd({ animated: true });
    }, 0);
  }

  render() {
    const tags = this.props.value.map((tag, index) => (
      <Tag
        index={index}
        label={this.props.labelExtractor(tag)}
        isLastTag={this.props.value.length === index + 1}
        onLayoutLastTag={this.onLayoutLastTag}
        removeIndex={this.removeIndex}
        tagColor={this.props.tagColor}
        tagTextColor={this.props.tagTextColor}
        tagContainerStyle={this.props.tagContainerStyle}
        tagTextStyle={this.props.tagTextStyle}
        key={index}
        editable={this.props.editable}
      />
    ));

    return (
      <TouchableWithoutFeedback
        onPress={this.focus}
        style={styles.container}
        onLayout={this.measureWrapper}
      >
        <View style={[styles.wrapper, { height: this.state.wrapperHeight }]}>
          <ScrollView
            ref={this.scrollViewRef}
            style={styles.tagInputContainerScroll}
            onContentSizeChange={this.onScrollViewContentSizeChange}
            keyboardShouldPersistTaps={
              ("handled": KeyboardShouldPersistTapsProps)
            }
            {...this.props.scrollViewProps}
          >
            <View style={styles.tagInputContainer}>
              {tags}
              <View style={[
                styles.textInputContainer,
                { width: this.state.inputWidth },
              ]}>
                <TextInput
                  ref={this.tagInputRef}
                  blurOnSubmit={false}
                  onKeyPress={this.onKeyPress}
                  value={this.props.text}
                  style={[styles.textInput, {
                    width: this.state.inputWidth,
                    color: this.props.inputColor,
                  }]}
                  onBlur={Platform.OS === "ios" ? this.onBlur : undefined}
                  onChangeText={this.props.onChangeText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Start typing"
                  returnKeyType="done"
                  keyboardType="default"
                  editable={this.props.editable}
                  underlineColorAndroid="rgba(0,0,0,0)"
                  {...this.props.inputProps}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  tagInputRef = (tagInput: ?React.ElementRef<typeof TextInput>) => {
    invariant(typeof tagInput === "object", "TextInput ref is object");
    this.tagInput = tagInput;
  }

  scrollViewRef = (scrollView: ?React.ElementRef<typeof ScrollView>) => {
    invariant(typeof scrollView === "object", "ScrollView ref is object");
    this.scrollView = scrollView;
  }

  onScrollViewContentSizeChange = (w: number, h: number) => {
    if (this.contentHeight === h) {
      return;
    }
    const nextWrapperHeight = Math.min(this.props.maxHeight, h);
    if (nextWrapperHeight !== this.state.wrapperHeight) {
      this.setState(
        { wrapperHeight: nextWrapperHeight },
        this.contentHeight < h ? this.scrollToEnd : undefined,
      );
    } else if (this.contentHeight < h) {
      this.scrollToEnd();
    }
    this.contentHeight = h;
  }

  onLayoutLastTag = (endPosOfTag: number) => {
    const margin = 3;
    this.spaceLeft = this.wrapperWidth - endPosOfTag - margin - 10;
    const inputWidth = TagInput.inputWidth(
      this.props.text,
      this.spaceLeft,
      this.props.inputDefaultWidth,
      this.wrapperWidth,
    );
    if (inputWidth !== this.state.inputWidth) {
      this.setState({ inputWidth });
    }
  }

}

type TagProps = {
  index: number,
  label: string | React.Element<any>,
  isLastTag: boolean,
  editable: boolean,
  onLayoutLastTag: (endPosOfTag: number) => void,
  removeIndex: (index: number) => void,
  tagColor: string,
  tagTextColor: string,
  tagContainerStyle?: StyleObj,
  tagTextStyle?: StyleObj,
};
class Tag extends React.PureComponent<TagProps> {

  props: TagProps;
  static propTypes = {
    index: PropTypes.number.isRequired,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
    isLastTag: PropTypes.bool.isRequired,
    editable: PropTypes.bool.isRequired,
    onLayoutLastTag: PropTypes.func.isRequired,
    removeIndex: PropTypes.func.isRequired,
    tagColor: PropTypes.string.isRequired,
    tagTextColor: PropTypes.string.isRequired,
    tagContainerStyle: ViewPropTypes.style,
    tagTextStyle: Text.propTypes.style,
  };
  curPos: ?number = null;

  componentWillReceiveProps(nextProps: TagProps) {
    if (
      !this.props.isLastTag &&
      nextProps.isLastTag &&
      this.curPos !== null &&
      this.curPos !== undefined
    ) {
      this.props.onLayoutLastTag(this.curPos);
    }
  }

  render() {
    let tagLabel;
    if (React.isValidElement(this.props.label)) {
      tagLabel = this.props.label;
    } else {
      tagLabel = (
        <Text style={[
            styles.tagText,
            { color: this.props.tagTextColor },
            this.props.tagTextStyle,
          ]}>
            {this.props.label}
            &nbsp;&times;
        </Text>
      );
    }
    return (
      <TouchableOpacity
        disabled={!this.props.editable}
        onPress={this.onPress}
        onLayout={this.onLayoutLastTag}
        style={[
          styles.tag,
          { backgroundColor: this.props.tagColor },
          this.props.tagContainerStyle,
        ]}
      >
        {tagLabel}
      </TouchableOpacity>
    );
  }

  onPress = () => {
    this.props.removeIndex(this.props.index);
  }

  onLayoutLastTag = (
    event: { nativeEvent: { layout: { x: number, width: number } } },
  ) => {
    const layout = event.nativeEvent.layout;
    this.curPos = layout.width + layout.x;
    if (this.props.isLastTag) {
      this.props.onLayoutLastTag(this.curPos);
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 3,
    marginBottom: 2,
    alignItems: 'flex-start',
  },
  tagInputContainerScroll: {
    flex: 1,
  },
  tagInputContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  textInput: {
    height: 36,
    fontSize: 16,
    flex: .6,
    marginBottom: 6,
    padding: 0,
  },
  textInputContainer: {
    height: 36,
  },
  tag: {
    justifyContent: 'center',
    marginTop: 6,
    marginRight: 3,
    padding: 8,
    height: 24,
    borderRadius: 2,
  },
  tagText: {
    padding: 0,
    margin: 0,
  },
});

export default TagInput;
