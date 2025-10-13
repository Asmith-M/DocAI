# TODO: Implement Sources Panel Functionality

## Backend Implementation

- [ ] Create new `/chat` API endpoint that returns JSON with `answer` and `sources`
- [ ] Implement source aggregation function to group chunks by filename and consolidate page numbers
- [ ] Update response format to match: `{"answer": "...", "sources": [{"fileName": "doc.pdf", "pages": "Pages 1, 3"}]}`

## Frontend Implementation

- [ ] Update API client (`lib/api.js`) to call new `/chat` endpoint
- [ ] Modify ChatContainer to handle new JSON response structure
- [ ] Add separate state for current sources (most recent AI response)
- [ ] Update SourcePanel component to display aggregated sources format
- [ ] Ensure sources update dynamically with each new AI response

## Testing

- [ ] Test backend endpoint returns correct format
- [ ] Test frontend displays sources correctly
- [ ] Test empty sources case
- [ ] Test multiple documents with different page ranges
